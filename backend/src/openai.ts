import { OpenAI } from 'openai';
import {
	ChatCompletionMessageParam,
	ChatCompletionTool,
	ChatCompletionMessageToolCall,
	ChatCompletionSystemMessageParam,
} from 'openai/resources/chat/completions';

import {
	isDefenceActive,
	getSystemRole,
	getQAPromptFromConfig,
} from './defence';
import { sendEmail } from './email';
import { queryDocuments } from './langchain';
import {
	CHAT_MESSAGE_TYPE,
	CHAT_MODELS,
	ChatHistoryMessage,
	ChatModel,
	ChatResponse,
} from './models/chat';
import { DEFENCE_ID, Defence } from './models/defence';
import { EmailInfo, EmailResponse } from './models/email';
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
					'OpenAI API key not found in environment vars - cannot continue!'
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
		const openAI = getOpenAI();
		const models: OpenAI.ModelsPage = await openAI.models.list();

		// get the model ids that are supported by our app
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
	const apiKey = getOpenAIKey();
	return new OpenAI({ apiKey });
}

function isChatGptFunction(functionName: string) {
	return chatGptTools.some((tool) => tool.function.name === functionName);
}

async function chatGptCallFunction(
	defences: Defence[],
	toolCallId: string,
	functionCall: ChatCompletionMessageToolCall.Function,
	sentEmails: EmailInfo[],
	// default to sandbox
	currentLevel: LEVEL_NAMES = LEVEL_NAMES.SANDBOX
) {
	const reply: ChatCompletionMessageParam = {
		role: 'tool',
		content: '',
		tool_call_id: toolCallId,
	};
	let wonLevel = false;
	// get the function name
	const functionName: string = functionCall.name;

	// check if we know the function
	if (isChatGptFunction(functionName)) {
		console.debug(`Function call: ${functionName}`);
		// call the function
		if (functionName === 'sendEmail') {
			if (functionCall.arguments) {
				const params = JSON.parse(
					functionCall.arguments
				) as FunctionSendEmailParams;
				console.debug('Send email params: ', JSON.stringify(params));
				const emailResponse: EmailResponse = sendEmail(
					params.address,
					params.subject,
					params.body,
					params.confirmed,
					currentLevel
				);
				reply.content = emailResponse.response;
				wonLevel = emailResponse.wonLevel;
				if (emailResponse.sentEmail) {
					sentEmails.push(emailResponse.sentEmail);
				}
			}
		}
		if (functionName === 'askQuestion') {
			if (functionCall.arguments) {
				const params = JSON.parse(
					functionCall.arguments
				) as FunctionAskQuestionParams;
				console.debug(`Asking question: ${params.question}`);
				// if asking a question, call the queryDocuments
				let configQAPrompt = '';
				if (isDefenceActive(DEFENCE_ID.QA_LLM, defences)) {
					configQAPrompt = getQAPromptFromConfig(defences);
				}
				reply.content = (
					await queryDocuments(params.question, configQAPrompt, currentLevel)
				).reply;
			} else {
				console.error('No arguments provided to askQuestion function');
				reply.content = "Reply with 'I don't know what to ask'";
			}
		}
	} else {
		console.error(`Unknown function: ${functionName}`);
		reply.content = 'Unknown function - reply again. ';
	}

	return {
		completion: reply,
		wonLevel,
	};
}

async function chatGptChatCompletion(
	chatHistory: ChatHistoryMessage[],
	defences: Defence[],
	chatModel: ChatModel,
	openai: OpenAI,
	// default to sandbox
	currentLevel: LEVEL_NAMES = LEVEL_NAMES.SANDBOX
) {
	// check if we need to set a system role
	// system role is always active on levels
	if (
		currentLevel !== LEVEL_NAMES.SANDBOX ||
		isDefenceActive(DEFENCE_ID.SYSTEM_ROLE, defences)
	) {
		const completionConfig: ChatCompletionSystemMessageParam = {
			role: 'system',
			content: getSystemRole(defences, currentLevel),
		};

		// check to see if there's already a system role
		const systemRole = chatHistory.find(
			(message) => message.completion?.role === 'system'
		);
		if (!systemRole) {
			// add the system role to the start of the chat history
			chatHistory.unshift({
				completion: completionConfig,
				chatMessageType: CHAT_MESSAGE_TYPE.SYSTEM,
			});
		} else {
			// replace with the latest system role
			systemRole.completion = completionConfig;
		}
	} else {
		// remove the system role from the chat history
		while (
			chatHistory.length > 0 &&
			chatHistory[0].completion?.role === 'system'
		) {
			chatHistory.shift();
		}
	}
	console.debug('Talking to model: ', JSON.stringify(chatModel));

	// get start time
	const startTime = new Date().getTime();
	console.debug('Calling OpenAI chat completion...');

	try {
		const chat_completion = await openai.chat.completions.create({
			model: chatModel.id,
			temperature: chatModel.configuration.temperature,
			top_p: chatModel.configuration.topP,
			frequency_penalty: chatModel.configuration.frequencyPenalty,
			presence_penalty: chatModel.configuration.presencePenalty,
			messages: getChatCompletionsFromHistory(chatHistory, chatModel.id),
			tools: chatGptTools,
		});
		console.debug(
			'chat_completion=',
			chat_completion.choices[0].message,
			' tokens=',
			chat_completion.usage
		);
		return chat_completion.choices[0].message;
	} finally {
		const endTime = new Date().getTime();
		console.debug(`OpenAI chat completion took ${endTime - startTime}ms`);
	}
}

function getChatCompletionsFromHistory(
	chatHistory: ChatHistoryMessage[],
	gptModel: CHAT_MODELS
): ChatCompletionMessageParam[] {
	// take only completions to send to model
	const completions: ChatCompletionMessageParam[] =
		chatHistory.length > 0
			? (chatHistory
					.filter((message) => message.completion !== null)
					.map((message) => message.completion) as ChatCompletionMessageParam[])
			: [];

	console.debug(
		'Number of tokens in total chat history. prompt_tokens=',
		countTotalPromptTokens(completions)
	);
	// limit the number of tokens sent to GPT to fit inside context window
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

function getBlankChatResponse(): ChatResponse {
	return {
		completion: null,
		defenceReport: {
			blockedReason: null,
			isBlocked: false,
			alertedDefences: [],
			triggeredDefences: [],
		},
		wonLevel: false,
		openAIErrorMessage: null,
	};
}

async function performToolCalls(
	toolCalls: ChatCompletionMessageToolCall[],
	chatHistory: ChatHistoryMessage[],
	defences: Defence[],
	sentEmails: EmailInfo[],
	currentLevel: LEVEL_NAMES
) {
	let wonLevel = false;
	for (const toolCall of toolCalls) {
		// only tool type supported by openai is function

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (toolCall.type === 'function') {
			// call the function and get a new reply and defence info from
			const functionCallReply = await chatGptCallFunction(
				defences,
				toolCall.id,
				toolCall.function,
				sentEmails,
				currentLevel
			);
			wonLevel = wonLevel || functionCallReply.wonLevel;

			// add the function call to the chat history
			pushMessageToHistory(chatHistory, {
				completion: functionCallReply.completion,
				chatMessageType: CHAT_MESSAGE_TYPE.FUNCTION_CALL,
			});
		}
	}
	return wonLevel;
}

async function getFinalReplyAfterAllToolCalls(
	chatHistory: ChatHistoryMessage[],
	defences: Defence[],
	chatModel: ChatModel,
	sentEmails: EmailInfo[],
	currentLevel: LEVEL_NAMES
) {
	const chatResponse: ChatResponse = getBlankChatResponse();
	const openai = getOpenAI();
	let reply: ChatCompletionMessageParam | null = null;

	do {
		try {
			reply = await chatGptChatCompletion(
				chatHistory,
				defences,
				chatModel,
				openai,
				currentLevel
			);
		} catch (error) {
			if (error instanceof Error) {
				console.error('Error calling createChatCompletion: ', error.message);
				chatResponse.openAIErrorMessage = error.message;
			}
			break;
		}

		if (reply.tool_calls) {
			// push the assistant message to the chat
			pushMessageToHistory(chatHistory, {
				completion: reply,
				chatMessageType: CHAT_MESSAGE_TYPE.FUNCTION_CALL,
			});

			const wonLevel = await performToolCalls(
				reply.tool_calls,
				chatHistory,
				defences,
				sentEmails,
				currentLevel
			);
			chatResponse.wonLevel = chatResponse.wonLevel || wonLevel;
		}

		// repeat until there are no more tool calls
	} while (reply.tool_calls);

	// chat history gets mutated, so no need to return it
	return { reply, chatResponse };
}

async function chatGptSendMessage(
	chatHistory: ChatHistoryMessage[],
	defences: Defence[],
	chatModel: ChatModel,
	message: string,
	sentEmails: EmailInfo[],
	currentLevel: LEVEL_NAMES = LEVEL_NAMES.SANDBOX
) {
	console.log(`User message: '${message}'`);

	// mutates chatHistory
	const { reply, chatResponse } = await getFinalReplyAfterAllToolCalls(
		chatHistory,
		defences,
		chatModel,
		sentEmails,
		currentLevel
	);

	if (reply?.content && !chatResponse.openAIErrorMessage) {
		chatResponse.completion = reply;
	}
	return chatResponse;
}

export const getValidOpenAIModelsList = validOpenAiModels.get;
export {
	chatGptTools,
	chatGptSendMessage,
	getOpenAIKey,
	getValidModelsFromOpenAI,
};
