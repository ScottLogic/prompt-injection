import { OpenAI } from 'openai';
import {
	ChatCompletionMessageParam,
	ChatCompletionTool,
	ChatCompletionMessageToolCall,
	ChatCompletionSystemMessageParam,
	ChatCompletionMessage,
} from 'openai/resources/chat/completions';
import { promptTokensEstimate } from 'openai-chat-tokens';

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
	ChatDefenceReport,
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

// max tokens each model can use
const chatModelMaxTokens = {
	[CHAT_MODELS.GPT_4_TURBO]: 128000,
	[CHAT_MODELS.GPT_4]: 8191,
	[CHAT_MODELS.GPT_4_0613]: 8191,
	[CHAT_MODELS.GPT_3_5_TURBO]: 4095,
	[CHAT_MODELS.GPT_3_5_TURBO_0613]: 4095,
	[CHAT_MODELS.GPT_3_5_TURBO_16K]: 16384,
	[CHAT_MODELS.GPT_3_5_TURBO_16K_0613]: 16384,
};

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
 * Checks the given model is supported by the OpenAI API key
 * @throws Error if the key cannot be used with the model
 */
async function verifyKeySupportsModel(gptModel: string) {
	const apiKey = getOpenAIKey();
	const testOpenAI: OpenAI = new OpenAI({ apiKey });
	await testOpenAI.chat.completions.create({
		model: gptModel,
		messages: [{ role: 'user', content: 'this is a test prompt' }],
	});
}

function getOpenAI() {
	const apiKey = getOpenAIKey();
	return new OpenAI({ apiKey });
}

function isChatGptFunction(functionName: string) {
	return chatGptTools.some((tool) => tool.function.name === functionName);
}

async function chatGptCallFunction(
	defenceReport: ChatDefenceReport,
	defences: Defence[],
	toolCallId: string,
	functionCall: ChatCompletionMessageToolCall.Function,
	sentEmails: EmailInfo[],
	// default to sandbox
	currentLevel: LEVEL_NAMES = LEVEL_NAMES.SANDBOX
) {
	let reply: ChatCompletionMessageParam | null = null;
	let wonLevel = false;
	// get the function name
	const functionName: string = functionCall.name;

	// check if we know the function
	if (isChatGptFunction(functionName)) {
		console.debug(`Function call: ${functionName}`);
		let response = '';
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
				response = emailResponse.response;
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
				response = (
					await queryDocuments(params.question, configQAPrompt, currentLevel)
				).reply;
			} else {
				console.error('No arguments provided to askQuestion function');
			}
		}
		reply = {
			role: 'tool',
			content: response,
			tool_call_id: toolCallId,
		};
	} else {
		console.error(`Unknown function: ${functionName}`);
	}

	if (reply) {
		return {
			completion: reply,
			defenceReport,
			wonLevel,
		};
	} else {
		return null;
	}
}

async function chatGptChatCompletion(
	chatHistory: ChatHistoryMessage[],
	defences: Defence[],
	chatModel: ChatModel,
	openai: OpenAI,
	// default to sandbox
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

		return chat_completion.choices[0].message;
	} catch (error) {
		if (error instanceof Error) {
			console.error('Error calling createChatCompletion: ', error.message);
			throw new Error(`Error calling createChatCompletion: ${error.message}`);
		}
	} finally {
		const endTime = new Date().getTime();
		console.debug(`OpenAI chat completion took ${endTime - startTime}ms`);
	}
}

// estimate the tokens on a single completion
function estimateMessageTokens(
	message: ChatCompletionMessageParam | null | undefined
) {
	if (message) {
		if ((message as ChatCompletionMessage).tool_calls) {
			const funcMessage = message as ChatCompletionMessage;
			const toolCalls = funcMessage.tool_calls?.map(
				(toolCall) => toolCall.function
			);
			if (toolCalls) {
				let estLTokens = 0;
				for (const toolCallContent of toolCalls) {
					// tool call not yet implemented in openai-chat-tokens so pass in as a function call
					estLTokens += promptTokensEstimate({
						messages: [
							{
								role: 'assistant',
								function_call: toolCallContent,
							} as ChatCompletionMessageParam,
						],
					});
					return estLTokens;
				}
			}
		} else {
			const estTokens = promptTokensEstimate({ messages: [message] });
			console.debug('message:', message, 'tokens:', estTokens);
			return estTokens;
		}
	}
	return 0;
}

// take only the chat history to send to GPT that is within the max tokens
function filterChatHistoryByMaxTokens(
	chatHistory: ChatCompletionMessageParam[],
	maxNumTokens: number
): ChatCompletionMessageParam[] {
	// estimate total prompt tokens including chat history and function call definitions

	const estimatedTokens =
		promptTokensEstimate({
			messages: chatHistory,
			functions: chatGptTools.map((tool) => tool.function),
		}) + 5; // there is an offset of 5 between openai completion prompt_tokens
	// if the estimated tokens is less than the max tokens, no need to filter

	if (estimatedTokens <= maxNumTokens) {
		return chatHistory;
	}

	console.log(
		'Filtering chat history to fit inside context window. estimated_tokens = ',
		estimatedTokens
	);
	let sumTokens = 0;
	const filteredList: ChatCompletionMessageParam[] = [];

	// reverse list to add from most recent
	const reverseList = chatHistory.slice().reverse();

	// always add the most recent message to start of list
	filteredList.push(reverseList[0]);
	sumTokens += estimateMessageTokens(reverseList[0]);

	// if the first message is a system role add it to list
	if (chatHistory[0].role === 'system') {
		sumTokens += estimateMessageTokens(chatHistory[0]);
		filteredList.push(chatHistory[0]);
	}

	// add elements after first message until max tokens reached
	for (let i = 1; i < reverseList.length; i++) {
		const element = reverseList[i];
		const numTokens = estimateMessageTokens(element);
		// if we reach end and system role is there skip as it's already been added
		if (element.role === 'system') {
			continue;
		}
		if (sumTokens + numTokens <= maxNumTokens) {
			filteredList.splice(i, 0, element);
			sumTokens += numTokens;
		} else {
			console.debug('Max tokens reached on completion = ', element);
			break;
		}
	}
	return filteredList.reverse();
}

// take only the completions to send to GPT
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

	// limit the number of tokens sent to GPT to fit inside context window
	const maxTokens = chatModelMaxTokens[gptModel];
	const reducedCompletions = filterChatHistoryByMaxTokens(
		completions,
		maxTokens
	);

	const diff = completions.length - reducedCompletions.length;
	if (diff > 0) {
		console.log(
			'Trimmed completions to fit inside context window. messages trimmed=',
			diff
		);
	}
	return completions;
}

function pushCompletionToHistory(
	chatHistory: ChatHistoryMessage[],
	completion: ChatCompletionMessageParam,
	chatMessageType: CHAT_MESSAGE_TYPE
) {
	// limit the length of the chat history
	const maxChatHistoryLength = 1000;

	if (chatMessageType !== CHAT_MESSAGE_TYPE.BOT_BLOCKED) {
		// remove the oldest message, not including system role message
		if (chatHistory.length >= maxChatHistoryLength) {
			if (chatHistory[0].completion?.role !== 'system') {
				chatHistory.shift();
			} else {
				chatHistory.splice(1, 1);
			}
		}
		chatHistory.push({
			completion,
			chatMessageType,
		});
	} else {
		// do not add the bots reply which was subsequently blocked
		console.log('Skipping adding blocked message to chat history', completion);
	}
	return chatHistory;
}

function getInitialDefenceReport(): ChatDefenceReport {
	return {
		blockedReason: '',
		isBlocked: false,
		alertedDefences: [],
		triggeredDefences: [],
	};
}

function getBlankChatResponse(): ChatResponse {
	return {
		completion: null,
		defenceReport: getInitialDefenceReport(),
		wonLevel: false,
	};
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
			`FILTER_USER_OUTPUT defence triggered. Detected phrases from blocklist: '${detectedPhrases.join(
				"', '"
			)}'.`
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

async function carryOutToolCalls(
	chatResponse: ChatResponse,
	toolCalls: ChatCompletionMessageToolCall[],
	chatHistory: ChatHistoryMessage[],
	defences: Defence[],
	sentEmails: EmailInfo[],
	currentLevel: LEVEL_NAMES
) {
	for (const toolCall of toolCalls) {
		// only tool type supported by openai is function

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (toolCall.type === 'function') {
			// call the function and get a new reply and defence info from
			const functionCallReply = await chatGptCallFunction(
				chatResponse.defenceReport,
				defences,
				toolCall.id,
				toolCall.function,
				sentEmails,
				currentLevel
			);
			if (functionCallReply) {
				chatResponse.wonLevel = functionCallReply.wonLevel;

				// add the function call to the chat history
				chatHistory = pushCompletionToHistory(
					chatHistory,
					functionCallReply.completion,
					CHAT_MESSAGE_TYPE.FUNCTION_CALL
				);
				// update the defence info
				chatResponse.defenceReport = functionCallReply.defenceReport;
			}
		} else {
			// openai chat tool call type not supported yet
			console.debug('Tool call type not supported yet: ', toolCall.type);
		}
	}
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
	let reply = await chatGptChatCompletion(
		chatHistory,
		defences,
		chatModel,
		openai,
		currentLevel
	);

	// if the reply is null, return empty chat response
	if (!reply) {
		throw Error('Failed to get reply from GPT');
	}

	// check if GPT wanted to call a tool
	while (reply?.tool_calls) {
		// push the assistant message to the chat
		chatHistory = pushCompletionToHistory(
			chatHistory,
			reply,
			CHAT_MESSAGE_TYPE.FUNCTION_CALL
		);

		await carryOutToolCalls(
			chatResponse,
			reply.tool_calls,
			chatHistory,
			defences,
			sentEmails,
			currentLevel
		);

		// get a new reply from ChatGPT now that the functions have been called
		reply = await chatGptChatCompletion(
			chatHistory,
			defences,
			chatModel,
			openai,
			currentLevel
		);
	}

	if (!reply) {
		throw Error('Failed to get reply from GPT');
	}

	// chat history gets mutated, so no need to return it
	return { reply, chatResponse };
}

async function chatGptSendMessage(
	chatHistory: ChatHistoryMessage[],
	defences: Defence[],
	chatModel: ChatModel,
	message: string,
	messageIsTransformed: boolean,
	sentEmails: EmailInfo[],
	// default to sandbox
	currentLevel: LEVEL_NAMES = LEVEL_NAMES.SANDBOX
) {
	console.log(`User message: '${message}'`);

	// add user message to chat
	chatHistory = pushCompletionToHistory(
		chatHistory,
		{
			role: 'user',
			content: message,
		},
		messageIsTransformed
			? CHAT_MESSAGE_TYPE.USER_TRANSFORMED
			: CHAT_MESSAGE_TYPE.USER
	);

	const { reply, chatResponse } = await getFinalReplyAfterAllToolCalls(
		chatHistory,
		defences,
		chatModel,
		sentEmails,
		currentLevel
	);

	if (!reply.content) {
		throw Error('Failed to get reply from GPT');
	}

	chatResponse.completion = reply;

	const outputFilterDefencePresent =
		currentLevel === LEVEL_NAMES.LEVEL_3 ||
		currentLevel === LEVEL_NAMES.SANDBOX;

	if (outputFilterDefencePresent) {
		applyOutputFilterDefence(reply.content, defences, chatResponse);
	}
	// add the ai reply to the chat history
	chatHistory = pushCompletionToHistory(
		chatHistory,
		reply,
		chatResponse.defenceReport.isBlocked
			? CHAT_MESSAGE_TYPE.BOT_BLOCKED
			: CHAT_MESSAGE_TYPE.BOT
	);

	// log the entire chat history so far
	console.log(chatHistory);
	return chatResponse;
}

export {
	chatGptSendMessage,
	filterChatHistoryByMaxTokens,
	getOpenAIKey,
	verifyKeySupportsModel,
};
