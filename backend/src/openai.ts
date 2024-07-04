import { inspect } from 'node:util';
import { OpenAI } from 'openai';
import {
	ChatCompletionMessageParam,
	ChatCompletionTool,
	ChatCompletionMessageToolCall,
} from 'openai/resources/chat/completions';

import { getQAPromptFromConfig } from './defence';
import { sendEmail } from './email';
import { queryDocuments } from './langchain';
import {
	CHAT_MODEL_ID,
	ChatModel,
	chatModelContextWindow,
	ChatModelReply,
	FunctionCallResponse,
	ToolCallResponse,
	chatModelIds,
} from './models/chat';
import { ChatMessage } from './models/chatMessage';
import { QaLlmDefence } from './models/defence';
import { EmailInfo, EmailResponse } from './models/email';
import { LEVEL_NAMES } from './models/level';
import {
	FunctionAskQuestionParams,
	FunctionSendEmailParams,
} from './models/openai';
import { pushMessageToHistory } from './utils/chat';
import {
	countTotalPromptTokens,
	truncateChatHistoryToContextWindow,
} from './utils/token';

// tools available to OpenAI models
const chatModelTools: ChatCompletionTool[] = [
	{
		type: 'function',
		function: {
			name: 'sendEmail',
			description: 'Send an email to someone',
			parameters: {
				type: 'object',
				properties: {
					address: {
						type: 'string',
						description: 'The email address to send the email to',
					},
					subject: {
						type: 'string',
						description: 'The subject of the email',
					},
					body: {
						type: 'string',
						description: 'The body of the email',
					},
					confirmed: {
						type: 'boolean',
						default: 'false',
						description:
							'whether the user has confirmed the email is correct before sending',
					},
				},
				required: ['address', 'subject', 'body', 'confirmed'],
			},
		},
	},
	{
		type: 'function',
		function: {
			name: 'askQuestion',
			description: 'Ask a question about information in the documents',
			parameters: {
				type: 'object',
				properties: {
					question: {
						type: 'string',
						description: 'The question asked about the documents',
					},
				},
			},
		},
	},
];

// list of valid chat models for the api key
const validOpenAiModels = (() => {
	let validModels: CHAT_MODEL_ID[] = [];
	return {
		get: () => validModels,
		set: (models: CHAT_MODEL_ID[]) => {
			validModels = models;
		},
	};
})();

const getOpenAIKey = (() => {
	let openAIKey: string | undefined = undefined;
	return () => {
		if (!openAIKey) {
			openAIKey = process.env.OPENAI_API_KEY;
			if (!openAIKey) {
				throw new Error(
					'OPENAI_API_KEY not found in environment vars, cannot continue!'
				);
			}
		}
		return openAIKey;
	};
})();

/**
 * Gets the GPT models available to the OpenAI API key
 */
async function getValidModelsFromOpenAI() {
	try {
		const models: OpenAI.ModelsPage = await getOpenAI().models.list();

		// get the model ids that are supported by our app. Non-chat models like Dall-e and whisper are not supported.
		const validModels = models.data
			.map((model) => model.id as CHAT_MODEL_ID)
			.filter((id) => chatModelIds.includes(id))
			.sort();
		if (!validModels.length) {
			throw new Error('No chat models found');
		}

		validOpenAiModels.set(validModels);
		console.debug('Valid OpenAI models:', validModels);
		return validModels;
	} catch (error) {
		console.error('Error getting valid models: ', error);
		throw error;
	}
}

function getOpenAI() {
	return new OpenAI({ apiKey: getOpenAIKey() });
}

function isChatModelFunction(functionName: string) {
	return chatModelTools.some((tool) => tool.function.name === functionName);
}

async function handleAskQuestionFunction(
	functionCallArgs: string | undefined,
	currentLevel: LEVEL_NAMES,
	qaLlmDefence?: QaLlmDefence
) {
	if (functionCallArgs) {
		const params = JSON.parse(functionCallArgs) as FunctionAskQuestionParams;
		console.debug(`Asking question: ${params.question}`);
		// if asking a question, call the queryDocuments
		const configQAPrompt = qaLlmDefence?.isActive
			? getQAPromptFromConfig([qaLlmDefence])
			: '';
		return await queryDocuments(params.question, configQAPrompt, currentLevel);
	} else {
		console.error(
			'Incorrect arguments provided to askQuestion function:',
			functionCallArgs
		);
		return "Reply with 'I don't know what to ask'";
	}
}

function handleSendEmailFunction(functionCallArgs: string | undefined) {
	if (functionCallArgs) {
		const params = JSON.parse(functionCallArgs) as FunctionSendEmailParams;
		console.debug('Send email params: ', JSON.stringify(params));

		const emailResponse: EmailResponse = sendEmail(
			params.address,
			params.subject,
			params.body,
			params.confirmed
		);
		return {
			reply: emailResponse.response,
			sentEmails: emailResponse.sentEmail ? [emailResponse.sentEmail] : [],
		};
	} else {
		console.error('No arguments provided to sendEmail function');
		return {
			reply: "Reply with 'I don't know what to send'",
			sentEmails: [] as EmailInfo[],
		};
	}
}

async function chatModelCallFunction(
	toolCallId: string,
	functionCall: ChatCompletionMessageToolCall.Function,
	// default to sandbox
	currentLevel: LEVEL_NAMES = LEVEL_NAMES.SANDBOX,
	qaLlmDefence?: QaLlmDefence
): Promise<FunctionCallResponse> {
	const functionName = functionCall.name;
	let functionReply = '';
	const sentEmails = [];

	// check if we know the function
	if (isChatModelFunction(functionName)) {
		console.debug(`Function call: ${functionName}`);
		// call the function
		if (functionName === 'sendEmail') {
			const emailFunctionOutput = handleSendEmailFunction(
				functionCall.arguments
			);
			functionReply = emailFunctionOutput.reply;
			sentEmails.push(...emailFunctionOutput.sentEmails);
		} else if (functionName === 'askQuestion') {
			functionReply = await handleAskQuestionFunction(
				functionCall.arguments,
				currentLevel,
				qaLlmDefence
			);
		}
	} else {
		console.error(`Unknown function: ${functionName}`);
		functionReply = 'Unknown function - reply again. ';
	}
	return {
		completion: {
			role: 'tool',
			content: functionReply,
			tool_call_id: toolCallId,
		} as ChatCompletionMessageParam,
		sentEmails,
	};
}

async function getChatModelCompletion(
	chatHistory: ChatMessage[],
	chatModel: ChatModel,
	openAI: OpenAI
) {
	console.debug('Talking to model: ', JSON.stringify(chatModel));

	const startTime = new Date().getTime();
	console.debug('Calling OpenAI chat completion...');

	try {
		const chat_completion = await openAI.chat.completions.create({
			model: chatModel.id,
			temperature: chatModel.configuration.temperature,
			top_p: chatModel.configuration.topP,
			frequency_penalty: chatModel.configuration.frequencyPenalty,
			presence_penalty: chatModel.configuration.presencePenalty,
			messages: getChatCompletionsInContextWindow(chatHistory, chatModel.id),
			tools: chatModelTools,
		});
		console.debug(
			'chat_completion =',
			inspect(chat_completion.choices[0].message, { depth: 4 }),
			' tokens =',
			chat_completion.usage
		);
		return {
			completion: chat_completion.choices[0].message,
			openAIErrorMessage: null,
		};
	} catch (error: unknown) {
		const openAIErrorMessage =
			error instanceof Error ? error.message : '(unknown error)';
		console.error('Error calling createChatCompletion: ', openAIErrorMessage);

		return {
			completion: null,
			openAIErrorMessage,
		};
	} finally {
		const endTime = new Date().getTime();
		console.debug(`OpenAI chat completion took ${endTime - startTime}ms`);
	}
}

function getChatCompletionsInContextWindow(
	chatHistory: ChatMessage[],
	gptModel: CHAT_MODEL_ID
): ChatCompletionMessageParam[] {
	const completions = chatHistory
		.map((chatMessage) =>
			'completion' in chatMessage ? chatMessage.completion : null
		)
		.filter(
			(completion) => completion !== null
		) as ChatCompletionMessageParam[];

	console.debug(
		'Number of tokens in total chat history. prompt_tokens=',
		countTotalPromptTokens(completions)
	);

	// 95% of max tokens to allow for response tokens - bit crude :(
	const maxTokens = chatModelContextWindow[gptModel] * 0.95;
	const reducedCompletions = truncateChatHistoryToContextWindow(
		completions,
		maxTokens
	);
	if (completions.length - reducedCompletions.length) {
		console.log(
			'Trimmed completions to fit inside context window. New total prompt_tokens=',
			countTotalPromptTokens(reducedCompletions)
		);
		console.log('New chat completions=', reducedCompletions);
	}
	return reducedCompletions;
}

async function performToolCalls(
	toolCalls: ChatCompletionMessageToolCall[],
	chatHistory: ChatMessage[],
	currentLevel: LEVEL_NAMES,
	qaLlmDefence?: QaLlmDefence
): Promise<ToolCallResponse> {
	const toolCallResults = await Promise.all(
		toolCalls.map((toolCall) =>
			chatModelCallFunction(
				toolCall.id,
				toolCall.function,
				currentLevel,
				qaLlmDefence
			)
		)
	);
	return toolCallResults.reduce<ToolCallResponse>(
		(combinedResponse, { completion, sentEmails }) => ({
			chatHistory: pushMessageToHistory(combinedResponse.chatHistory, {
				completion,
				chatMessageType: 'FUNCTION_CALL',
			}),
			sentEmails: combinedResponse.sentEmails.concat(...sentEmails),
		}),
		{
			chatHistory,
			sentEmails: [],
		}
	);
}

async function getFinalReplyAfterAllToolCalls(
	chatHistory: ChatMessage[],
	chatModel: ChatModel,
	currentLevel: LEVEL_NAMES,
	qaLlmDefence?: QaLlmDefence
) {
	let updatedChatHistory = [...chatHistory];
	const sentEmails = [];
	const openAI = getOpenAI();
	let modelReply: ChatModelReply | null = null;

	do {
		modelReply = await getChatModelCompletion(
			updatedChatHistory,
			chatModel,
			openAI
		);

		if (modelReply.completion?.tool_calls?.length) {
			updatedChatHistory = pushMessageToHistory(updatedChatHistory, {
				completion: modelReply.completion,
				chatMessageType: 'FUNCTION_CALL',
			});

			const toolCallReply = await performToolCalls(
				modelReply.completion.tool_calls,
				updatedChatHistory,
				currentLevel,
				qaLlmDefence
			);

			updatedChatHistory = toolCallReply.chatHistory;
			sentEmails.push(...toolCallReply.sentEmails);
		}
	} while (modelReply.completion?.tool_calls);

	return {
		modelReply,
		chatHistory: updatedChatHistory,
		sentEmails,
	};
}

async function chatModelSendMessage(
	priorChatHistory: ChatMessage[],
	chatModel: ChatModel,
	currentLevel: LEVEL_NAMES = LEVEL_NAMES.SANDBOX,
	qaLlmDefence?: QaLlmDefence
) {
	// this method just calls getFinalReplyAfterAllToolCalls then reformats the output. Does it need to exist?

	const {
		chatHistory: updatedChatHistory,
		modelReply: chatResponse,
		sentEmails,
	} = await getFinalReplyAfterAllToolCalls(
		priorChatHistory,
		chatModel,
		currentLevel,
		qaLlmDefence
	);

	const successfulReply =
		chatResponse.completion?.content && !chatResponse.openAIErrorMessage;

	return {
		chatResponse,
		chatHistory: successfulReply ? updatedChatHistory : priorChatHistory,
		sentEmails,
	};
}

export const getValidOpenAIModels = validOpenAiModels.get;
export {
	chatModelTools,
	chatModelSendMessage,
	getOpenAIKey,
	getValidModelsFromOpenAI,
};
