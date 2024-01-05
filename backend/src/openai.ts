import { OpenAI } from 'openai';
import {
	ChatCompletionMessageParam,
	ChatCompletionTool,
	ChatCompletionMessageToolCall,
	ChatCompletionSystemMessageParam,
	ChatCompletionMessage,
} from 'openai/resources/chat/completions';

import {
	isDefenceActive,
	getSystemRole,
	detectFilterList,
	getFilterList,
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
	FunctionCallResponse,
	ToolCallResponse,
} from './models/chat';
import { DEFENCE_ID, Defence } from './models/defence';
import { EmailInfo, EmailResponse } from './models/email';
import { LEVEL_NAMES } from './models/level';
import {
	FunctionAskQuestionParams,
	FunctionSendEmailParams,
} from './models/openai';
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

async function handleAskQuestionFunction(
	functionCallArgs: string | undefined,
	currentLevel: LEVEL_NAMES,
	defences: Defence[]
) {
	if (functionCallArgs) {
		const params = JSON.parse(functionCallArgs) as FunctionAskQuestionParams;
		console.debug(`Asking question: ${params.question}`);
		// if asking a question, call the queryDocuments
		let configQAPrompt = '';
		if (isDefenceActive(DEFENCE_ID.QA_LLM, defences)) {
			configQAPrompt = getQAPromptFromConfig(defences);
		}
		return {
			reply: (
				await queryDocuments(params.question, configQAPrompt, currentLevel)
			).reply,
		};
	} else {
		console.error('No arguments provided to askQuestion function');
		return { reply: "Reply with 'I don't know what to ask'" };
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
	sentEmails: EmailInfo[],
	// default to sandbox
	currentLevel: LEVEL_NAMES = LEVEL_NAMES.SANDBOX
): Promise<FunctionCallResponse> {
	const functionName = functionCall.name;
	let functionReply = '';
	let wonLevel = false;
	const updatedSentEmails = [...sentEmails];

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
				updatedSentEmails.push(...emailFunctionOutput.sentEmails);
			}
		}
		if (functionName === 'askQuestion') {
			const askQuestionFunctionOutput = await handleAskQuestionFunction(
				functionCall.arguments,
				currentLevel,
				defences
			);
			functionReply = askQuestionFunctionOutput.reply;
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
		sentEmails: updatedSentEmails,
	};
}

async function chatGptChatCompletion(
	chatHistory: ChatHistoryMessage[],
	defences: Defence[],
	chatModel: ChatModel,
	openai: OpenAI,
	// default to sandbox
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	currentLevel: LEVEL_NAMES = LEVEL_NAMES.SANDBOX
): Promise<{
	completion: ChatCompletionMessage | null;
	chatHistory: ChatHistoryMessage[];
	openAIErrorMessage: string | null;
}> {
	console.log('chatGptChatCompletion: chatHistory=', chatHistory);

	const updatedChatHistory = [...chatHistory];

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
			updatedChatHistory.unshift({
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
			updatedChatHistory.length > 0 &&
			updatedChatHistory[0].completion?.role === 'system'
		) {
			updatedChatHistory.shift();
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
			messages: getChatCompletionsFromHistory(updatedChatHistory, chatModel.id),
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
		if (error instanceof Error) {
			console.error('Error calling createChatCompletion: ', error.message);
		}
		return {
			completion: null,
			chatHistory: updatedChatHistory,
			openAIErrorMessage: 'TODO - ERROR MSG',
		};
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

function pushCompletionToHistory(
	chatHistory: ChatHistoryMessage[],
	completion: ChatCompletionMessageParam,
	chatMessageType: CHAT_MESSAGE_TYPE
): ChatHistoryMessage[] {
	// limit the length of the chat history
	const maxChatHistoryLength = 1000;
	const updatedChatHistory = [...chatHistory];

	if (chatMessageType !== CHAT_MESSAGE_TYPE.BOT_BLOCKED) {
		// remove the oldest message, not including system role message
		if (chatHistory.length >= maxChatHistoryLength) {
			if (chatHistory[0].completion?.role !== 'system') {
				updatedChatHistory.shift();
			} else {
				updatedChatHistory.splice(1, 1);
			}
		}
		updatedChatHistory.push({
			completion,
			chatMessageType,
		});
	} else {
		// do not add the bots reply which was subsequently blocked
		console.log('Skipping adding blocked message to chat history', completion);
	}
	return updatedChatHistory;
}

function applyOutputFilterDefence(
	message: string,
	defences: Defence[],
	chatResponse: ChatResponse
) {
	const detectedPhrases = detectFilterList(
		message,
		getFilterList(defences, DEFENCE_ID.FILTER_BOT_OUTPUT)
	);

	if (detectedPhrases.length > 0) {
		console.debug(
			'FILTER_BOT_OUTPUT defence triggered. Detected phrases from blocklist:',
			detectedPhrases
		);
		if (isDefenceActive(DEFENCE_ID.FILTER_BOT_OUTPUT, defences)) {
			chatResponse.defenceReport.triggeredDefences.push(
				DEFENCE_ID.FILTER_BOT_OUTPUT
			);
			chatResponse.defenceReport.isBlocked = true;
			chatResponse.defenceReport.blockedReason =
				'My original response was blocked as it contained a restricted word/phrase. Ask me something else. ';
		} else {
			chatResponse.defenceReport.alertedDefences.push(
				DEFENCE_ID.FILTER_BOT_OUTPUT
			);
		}
	}
}

async function performToolCalls(
	toolCalls: ChatCompletionMessageToolCall[],
	chatHistory: ChatHistoryMessage[],
	defences: Defence[],
	sentEmails: EmailInfo[],
	currentLevel: LEVEL_NAMES
): Promise<ToolCallResponse> {
	let updatedChatHistory = [...chatHistory];

	for (const toolCall of toolCalls) {
		// only tool type supported by openai is function

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (toolCall.type === 'function') {
			const functionCallReply = await chatGptCallFunction(
				defences,
				toolCall.id,
				toolCall.function,
				sentEmails,
				currentLevel
			);
			updatedChatHistory = pushCompletionToHistory(
				updatedChatHistory,
				functionCallReply.completion,
				CHAT_MESSAGE_TYPE.FUNCTION_CALL
			);
			return {
				functionCallReply,
				chatHistory: updatedChatHistory,
			};
		}
	}
	// if no function called, return original state
	return {
		chatHistory,
	};
}

async function getFinalReplyAfterAllToolCalls(
	initChatHistory: ChatHistoryMessage[],
	defences: Defence[],
	chatModel: ChatModel,
	sentEmails: EmailInfo[],
	currentLevel: LEVEL_NAMES
) {
	let updatedSentEmails = [...sentEmails];
	let wonLevel = false;
	const openai = getOpenAI();

	let gptReply = await chatGptChatCompletion(
		[...initChatHistory],
		defences,
		chatModel,
		openai,
		currentLevel
	);
	let updatedChatHistory = gptReply.chatHistory;

	// check if GPT wanted to call a tool
	while (gptReply.completion?.tool_calls) {
		// push the assistant message to the chat
		updatedChatHistory = pushCompletionToHistory(
			updatedChatHistory,
			gptReply.completion,
			CHAT_MESSAGE_TYPE.FUNCTION_CALL
		);

		const toolCallReply = await performToolCalls(
			gptReply.completion.tool_calls,
			updatedChatHistory,
			defences,
			updatedSentEmails,
			currentLevel
		);

		updatedChatHistory = toolCallReply.chatHistory;
		updatedSentEmails =
			toolCallReply.functionCallReply?.sentEmails ?? updatedSentEmails;
		wonLevel = toolCallReply.functionCallReply?.wonLevel ?? false;

		// get a new reply from ChatGPT now that the functions have been called
		gptReply = await chatGptChatCompletion(
			updatedChatHistory,
			defences,
			chatModel,
			openai,
			currentLevel
		);
	}
	return {
		gptReply,
		wonLevel,
		chatHistory: updatedChatHistory,
		sentEmails: updatedSentEmails,
		errorMessage: gptReply.openAIErrorMessage,
	};
}

async function chatGptSendMessage(
	chatHistory: ChatHistoryMessage[],
	defences: Defence[],
	chatModel: ChatModel,
	message: string,
	messageIsTransformed: boolean,
	sentEmails: EmailInfo[],
	currentLevel: LEVEL_NAMES = LEVEL_NAMES.SANDBOX
) {
	console.log(`User message: '${message}'`);

	// add user message to chat
	let updatedChatHistory = pushCompletionToHistory(
		[...chatHistory],
		{
			role: 'user',
			content: message,
		},
		messageIsTransformed
			? CHAT_MESSAGE_TYPE.USER_TRANSFORMED
			: CHAT_MESSAGE_TYPE.USER
	);
	const finalToolCallResponse = await getFinalReplyAfterAllToolCalls(
		updatedChatHistory,
		[...defences],
		chatModel,
		[...sentEmails],
		currentLevel
	);

	const replyCompletion = finalToolCallResponse.gptReply.completion;
	updatedChatHistory = finalToolCallResponse.chatHistory;
	const updatedSentEmails = finalToolCallResponse.sentEmails;

	const chatResponse: ChatResponse = {
		completion: replyCompletion,
		defenceReport: {
			blockedReason: '',
			isBlocked: false,
			alertedDefences: [],
			triggeredDefences: [],
		},
		wonLevel: finalToolCallResponse.wonLevel,
		openAIErrorMessage: finalToolCallResponse.gptReply.openAIErrorMessage,
	};

	if (!chatResponse.completion?.content || chatResponse.openAIErrorMessage) {
		return { chatResponse, chatHistory, sentEmails, defences };
	}

	// TODO - being moved in other refactor
	// if (
	// 	currentLevel === LEVEL_NAMES.LEVEL_3 ||
	// 	currentLevel === LEVEL_NAMES.SANDBOX
	// ) {
	// 	applyOutputFilterDefence(chatResponse.completion.content, defences, chatResponse);
	// }

	// add the ai reply to the chat history
	updatedChatHistory = pushCompletionToHistory(
		updatedChatHistory,
		chatResponse.completion,
		chatResponse.defenceReport.isBlocked
			? CHAT_MESSAGE_TYPE.BOT_BLOCKED
			: CHAT_MESSAGE_TYPE.BOT
	);

	// log the entire chat history so far
	console.log(chatHistory);
	return {
		chatResponse,
		chatHistory: updatedChatHistory,
		sentEmails: updatedSentEmails,
		defences,
	};
}

export const getValidOpenAIModelsList = validOpenAiModels.get;
export {
	chatGptTools,
	chatGptSendMessage,
	getOpenAIKey,
	getValidModelsFromOpenAI,
};
