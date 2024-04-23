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
	ChatGptReply,
	ChatModel,
	ChatResponse,
	FunctionCallResponse,
	ToolCallResponse,
	chatModelIds,
} from './models/chat';
import { ChatMessage } from './models/chatMessage';
import { QaLlmDefence } from './models/defence';
import { EmailResponse } from './models/email';
import { LEVEL_NAMES } from './models/level';
import {
	FunctionAskQuestionParams,
	FunctionSendEmailParams,
} from './models/openai';
import { pushMessageToHistory } from './utils/chat';
import {
	chatModelMaxTokens,
	countTotalPromptTokens,
	filterChatHistoryByMaxTokens,
} from './utils/token';

// tools available to chatGPT
const chatGptTools: ChatCompletionTool[] = [
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

function isChatGptFunction(functionName: string) {
	return chatGptTools.some((tool) => tool.function.name === functionName);
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
			sendEmails: [],
		};
	}
}

async function chatGptCallFunction(
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
	if (isChatGptFunction(functionName)) {
		console.debug(`Function call: ${functionName}`);
		// call the function
		if (functionName === 'sendEmail') {
			const emailFunctionOutput = handleSendEmailFunction(
				functionCall.arguments
			);
			functionReply = emailFunctionOutput.reply;
			if (emailFunctionOutput.sentEmails) {
				sentEmails.push(...emailFunctionOutput.sentEmails);
			}
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

async function chatGptChatCompletion(
	chatHistory: ChatMessage[],
	chatModel: ChatModel,
	openAI: OpenAI
) {
	const updatedChatHistory = [...chatHistory];

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
			messages: getChatCompletionsInContextWindow(
				updatedChatHistory,
				chatModel.id
			),
			tools: chatGptTools,
		});
		console.debug(
			'chat_completion=',
			inspect(chat_completion.choices[0].message, { depth: 4 }),
			' tokens=',
			chat_completion.usage
		);
		return {
			completion: chat_completion.choices[0].message,
			chatHistory: updatedChatHistory,
			openAIErrorMessage: null,
		};
	} catch (error) {
		let openAIErrorMessage = '';
		if (error instanceof Error) {
			console.error('Error calling createChatCompletion: ', error.message);
			openAIErrorMessage = error.message;
		}
		return {
			completion: null,
			chatHistory: updatedChatHistory,
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

	const maxTokens = chatModelMaxTokens[gptModel] * 0.95; // 95% of max tokens to allow for response tokens
	const reducedCompletions = filterChatHistoryByMaxTokens(
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
	for (const toolCall of toolCalls) {
		// only tool type supported by openai is function
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (toolCall.type === 'function') {
			const functionCallReply = await chatGptCallFunction(
				toolCall.id,
				toolCall.function,
				currentLevel,
				qaLlmDefence
			);

			// We assume only one function call in toolCalls, and so we return after getting function reply.
			return {
				functionCallReply,
				chatHistory: pushMessageToHistory(chatHistory, {
					completion: functionCallReply.completion,
					chatMessageType: 'FUNCTION_CALL',
				}),
			};
		}
	}
	// if no function called, return original state
	return {
		chatHistory,
	};
}

async function getFinalReplyAfterAllToolCalls(
	chatHistory: ChatMessage[],
	chatModel: ChatModel,
	currentLevel: LEVEL_NAMES,
	qaLlmDefence?: QaLlmDefence
) {
	let updatedChatHistory = [...chatHistory];
	const sentEmails = [];

	let gptReply: ChatGptReply | null = null;
	const openAI = getOpenAI();
	do {
		gptReply = await chatGptChatCompletion(
			updatedChatHistory,
			chatModel,
			openAI
		);
		updatedChatHistory = gptReply.chatHistory;

		if (gptReply.completion?.tool_calls) {
			updatedChatHistory = pushMessageToHistory(updatedChatHistory, {
				completion: gptReply.completion,
				chatMessageType: 'FUNCTION_CALL',
			});

			const toolCallReply = await performToolCalls(
				gptReply.completion.tool_calls,
				updatedChatHistory,
				currentLevel,
				qaLlmDefence
			);

			updatedChatHistory = toolCallReply.chatHistory;
			if (toolCallReply.functionCallReply?.sentEmails) {
				sentEmails.push(...toolCallReply.functionCallReply.sentEmails);
			}
		}
	} while (gptReply.completion?.tool_calls);

	return {
		gptReply,
		chatHistory: updatedChatHistory,
		sentEmails,
	};
}

async function chatGptSendMessage(
	chatHistory: ChatMessage[],
	chatModel: ChatModel,
	currentLevel: LEVEL_NAMES = LEVEL_NAMES.SANDBOX,
	qaLlmDefence?: QaLlmDefence
) {
	// this method just calls getFinalReplyAfterAllToolCalls then reformats the output. Does it need to exist?

	const finalToolCallResponse = await getFinalReplyAfterAllToolCalls(
		chatHistory,
		chatModel,
		currentLevel,
		qaLlmDefence
	);

	const chatResponse: ChatResponse = {
		completion: finalToolCallResponse.gptReply.completion,
		openAIErrorMessage: finalToolCallResponse.gptReply.openAIErrorMessage,
	};

	const successfulReply =
		chatResponse.completion?.content && !chatResponse.openAIErrorMessage;

	return {
		chatResponse,
		chatHistory: successfulReply
			? finalToolCallResponse.chatHistory
			: chatHistory,
		sentEmails: finalToolCallResponse.sentEmails,
	};
}

export const getValidOpenAIModels = validOpenAiModels.get;
export {
	chatGptTools,
	chatGptSendMessage,
	getOpenAIKey,
	getValidModelsFromOpenAI,
};
