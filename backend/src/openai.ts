import { OpenAI } from 'openai';
import {
	ChatCompletionMessageParam,
	ChatCompletionTool,
	ChatCompletionMessageToolCall,
} from 'openai/resources/chat/completions';

import { isDefenceActive, getQAPromptFromConfig } from './defence';
import { sendEmail } from './email';
import { queryDocuments } from './langchain';
import {
	CHAT_MODELS,
	ChatGptReply,
	ChatModel,
	ChatResponse,
	FunctionCallResponse,
	ToolCallResponse,
} from './models/chat';
import { ChatMessage } from './models/chatMessage';
import { DEFENCE_ID, Defence } from './models/defence';
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
	let validModels: string[] = [];
	return {
		get: () => validModels,
		set: (models: string[]) => {
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
			.map((model) => model.id)
			.filter((id) => Object.values(CHAT_MODELS).includes(id as CHAT_MODELS))
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
	defences: Defence[]
) {
	if (functionCallArgs) {
		const params = JSON.parse(functionCallArgs) as FunctionAskQuestionParams;
		console.debug(`Asking question: ${params.question}`);
		// if asking a question, call the queryDocuments
		const configQAPrompt = isDefenceActive(DEFENCE_ID.QA_LLM, defences)
			? getQAPromptFromConfig(defences)
			: '';
		return await queryDocuments(params.question, configQAPrompt, currentLevel);
	} else {
		console.error('No arguments provided to askQuestion function');
		return "Reply with 'I don't know what to ask'";
	}
}

function handleSendEmailFunction(
	functionCallArgs: string | undefined,
	currentLevel: LEVEL_NAMES
) {
	if (functionCallArgs) {
		const params = JSON.parse(functionCallArgs) as FunctionSendEmailParams;
		console.debug('Send email params: ', JSON.stringify(params));

		const emailResponse: EmailResponse = sendEmail(
			params.address,
			params.subject,
			params.body,
			params.confirmed,
			currentLevel
		);
		return {
			reply: emailResponse.response,
			wonLevel: emailResponse.wonLevel,
			sentEmails: emailResponse.sentEmail ? [emailResponse.sentEmail] : [],
		};
	} else {
		console.error('No arguments provided to sendEmail function');
		return {
			reply: "Reply with 'I don't know what to send'",
			wonLevel: false,
			sendEmails: [],
		};
	}
}

async function chatGptCallFunction(
	defences: Defence[],
	toolCallId: string,
	functionCall: ChatCompletionMessageToolCall.Function,
	// default to sandbox
	currentLevel: LEVEL_NAMES = LEVEL_NAMES.SANDBOX
): Promise<FunctionCallResponse> {
	const functionName = functionCall.name;
	let functionReply = '';
	let wonLevel = false;
	const sentEmails = [];

	// check if we know the function
	if (isChatGptFunction(functionName)) {
		console.debug(`Function call: ${functionName}`);
		// call the function
		if (functionName === 'sendEmail') {
			const emailFunctionOutput = handleSendEmailFunction(
				functionCall.arguments,
				currentLevel
			);
			functionReply = emailFunctionOutput.reply;
			wonLevel = emailFunctionOutput.wonLevel;
			if (emailFunctionOutput.sentEmails) {
				sentEmails.push(...emailFunctionOutput.sentEmails);
			}
		} else if (functionName === 'askQuestion') {
			functionReply = await handleAskQuestionFunction(
				functionCall.arguments,
				currentLevel,
				defences
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
		wonLevel,
		sentEmails,
	};
}

async function chatGptChatCompletion(
	chatHistory: ChatMessage[],
	chatModel: ChatModel
) {
	const updatedChatHistory = [...chatHistory];

	console.debug('Talking to model: ', JSON.stringify(chatModel));

	const startTime = new Date().getTime();
	console.debug('Calling OpenAI chat completion...');

	try {
		const chat_completion = await getOpenAI().chat.completions.create({
			model: chatModel.id,
			temperature: chatModel.configuration.temperature,
			top_p: chatModel.configuration.topP,
			frequency_penalty: chatModel.configuration.frequencyPenalty,
			presence_penalty: chatModel.configuration.presencePenalty,
			messages: getChatCompletionsInLimitedContextWindow(
				updatedChatHistory,
				chatModel.id
			),
			tools: chatGptTools,
		});
		console.debug(
			'chat_completion=',
			chat_completion.choices[0].message,
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

function getChatCompletionsInLimitedContextWindow(
	chatHistory: ChatMessage[],
	gptModel: CHAT_MODELS
): ChatCompletionMessageParam[] {
	const completions = chatHistory.reduce<ChatCompletionMessageParam[]>(
		(result, chatMessage) => {
			if ('completion' in chatMessage && chatMessage.completion) {
				result.push(chatMessage.completion);
			}
			return result;
		},
		[]
	);

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
	defences: Defence[],
	currentLevel: LEVEL_NAMES
): Promise<ToolCallResponse> {
	for (const toolCall of toolCalls) {
		// only tool type supported by openai is function
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (toolCall.type === 'function') {
			const functionCallReply = await chatGptCallFunction(
				defences,
				toolCall.id,
				toolCall.function,
				currentLevel
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
	defences: Defence[],
	chatModel: ChatModel,
	currentLevel: LEVEL_NAMES
) {
	let updatedChatHistory = [...chatHistory];
	const sentEmails = [];
	let wonLevel = false;

	let gptReply: ChatGptReply | null = null;

	do {
		gptReply = await chatGptChatCompletion(updatedChatHistory, chatModel);
		updatedChatHistory = gptReply.chatHistory;

		if (gptReply.completion?.tool_calls) {
			updatedChatHistory = pushMessageToHistory(updatedChatHistory, {
				completion: gptReply.completion,
				chatMessageType: 'FUNCTION_CALL',
			});

			const toolCallReply = await performToolCalls(
				gptReply.completion.tool_calls,
				updatedChatHistory,
				defences,
				currentLevel
			);

			updatedChatHistory = toolCallReply.chatHistory;
			if (toolCallReply.functionCallReply?.sentEmails) {
				sentEmails.push(...toolCallReply.functionCallReply.sentEmails);
			}
			wonLevel =
				(wonLevel || toolCallReply.functionCallReply?.wonLevel) ?? false;
		}
	} while (gptReply.completion?.tool_calls);

	return {
		gptReply,
		wonLevel,
		chatHistory: updatedChatHistory,
		sentEmails,
	};
}

async function chatGptSendMessage(
	chatHistory: ChatMessage[],
	defences: Defence[],
	chatModel: ChatModel,
	currentLevel: LEVEL_NAMES = LEVEL_NAMES.SANDBOX
) {
	// this method just calls getFinalReplyAfterAllToolCalls then reformats the output. Does it need to exist?

	const finalToolCallResponse = await getFinalReplyAfterAllToolCalls(
		chatHistory,
		defences,
		chatModel,
		currentLevel
	);

	const chatResponse: ChatResponse = {
		completion: finalToolCallResponse.gptReply.completion,
		wonLevel: finalToolCallResponse.wonLevel,
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

export const getValidOpenAIModelsList = validOpenAiModels.get;
export {
	chatGptTools,
	chatGptSendMessage,
	getOpenAIKey,
	getValidModelsFromOpenAI,
};
