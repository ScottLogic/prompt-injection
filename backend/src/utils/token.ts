import {
	ChatCompletionAssistantMessageParam,
	ChatCompletionMessageParam,
	ChatCompletionMessageToolCall,
} from 'openai/resources/chat/completions';
import {
	functionsTokensEstimate,
	promptTokensEstimate,
	messageTokensEstimate,
	stringTokens,
} from 'openai-chat-tokens';
import { FunctionDef } from 'openai-chat-tokens/dist/functions';

import { CHAT_MODELS } from '@src/models/chat';
import { chatGptTools } from '@src/openai';

// max tokens each model can use
const chatModelMaxTokens = {
	[CHAT_MODELS.GPT_4_TURBO]: 128000,
	[CHAT_MODELS.GPT_4]: 8191,
	[CHAT_MODELS.GPT_4_0613]: 8191,
	[CHAT_MODELS.GPT_3_5_TURBO]: 300, // todo - change to 4095
	[CHAT_MODELS.GPT_3_5_TURBO_0613]: 4095,
	[CHAT_MODELS.GPT_3_5_TURBO_16K]: 16384,
	[CHAT_MODELS.GPT_3_5_TURBO_16K_0613]: 16384,
};

// estimate the tokens on a single completion
function countMessageTokens(
	message: ChatCompletionMessageParam | null | undefined
) {
	if (message) {
		if ((message as ChatCompletionAssistantMessageParam).tool_calls) {
			const toolCalls = (message as ChatCompletionAssistantMessageParam)
				.tool_calls;
			return toolCalls ? countSingleToolCallTokens(toolCalls) : 0;
		} else {
			return messageTokensEstimate(message);
		}
	}
	return 0;
}

function countSingleToolCallTokens(toolCall: ChatCompletionMessageToolCall[]) {
	return toolCall.reduce((acc, toolCall) => {
		const {
			function: { name, arguments: args },
		} = toolCall;
		return acc + stringTokens(name) + stringTokens(args);
	}, 0);
}

// count total tool call in chat histroy tokens - not supported by openai-chat-tokens yet. To be removed when supported
function countToolCallTokens(chatHistory: ChatCompletionMessageParam[]) {
	let numToolCalls = 0;
	let tokens = 0;
	for (const message of chatHistory) {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (message.role === 'assistant' && message.tool_calls) {
			numToolCalls += message.tool_calls.length;
			tokens += countSingleToolCallTokens(message.tool_calls);
		}
	}
	return tokens + numToolCalls * 4; // 4 tokens per tool call
}

// estimate total number of tokens across whole chat history
function countTotalPromptTokens(chatHistory: ChatCompletionMessageParam[]) {
	return (
		promptTokensEstimate({
			messages: chatHistory,
			functions: chatGptTools.map((tool) => tool.function),
		}) +
		countToolCallTokens(chatHistory) +
		5
	); // there is an offset of 5 between openai completion prompt_tokens
}

// take only the chat history to send to GPT that is within the max tokens
function filterChatHistoryByMaxTokens(
	chatHistory: ChatCompletionMessageParam[],
	maxNumTokens: number
): ChatCompletionMessageParam[] {
	// estimate total prompt tokens including chat history and function call definitions#

	const estimatedTokens = countTotalPromptTokens(chatHistory);
	// if the estimated tokens is less than the max tokens, no need to filter
	if (estimatedTokens <= maxNumTokens) {
		return chatHistory;
	}
	console.log(
		'Filtering chat history to fit inside context window. estimated_tokens= ',
		estimatedTokens,
		'maxNumTokens=',
		maxNumTokens
	);

	let sumTokens = 0;
	const filteredList: ChatCompletionMessageParam[] = [];

	const functionDefs = chatGptTools.map(
		(tool) => tool.function
	) as unknown as FunctionDef[];

	// add function definitions to sum of tokens
	sumTokens += functionsTokensEstimate(functionDefs);
	// reverse list to add from most recent
	const reverseHistory = chatHistory.slice().reverse();

	// always add the most recent message to start of list
	filteredList.push(reverseHistory[0]);
	sumTokens += countMessageTokens(reverseHistory[0]);

	// if the first message is a system role add it to list
	if (chatHistory[0].role === 'system') {
		sumTokens += countMessageTokens(chatHistory[0]);
		filteredList.push(chatHistory[0]);
	}

	// add elements after first message until max tokens reached
	for (let i = 1; i < reverseHistory.length; i++) {
		const message = reverseHistory[i];
		const numTokens = countMessageTokens(message);
		// if we reach end and system role is there skip as it's already been added
		if (message.role === 'system') {
			continue;
		}
		if (sumTokens + numTokens <= maxNumTokens) {
			filteredList.splice(i, 0, message);
			sumTokens += numTokens;
		} else {
			console.debug('Max tokens reached on completion= ', message);
			break;
		}
	}
	console.debug(
		'Filtered chat history. sumTokens=',
		sumTokens,
		'filteredList=',
		filteredList
	);
	return filteredList.reverse();
}

export {
	chatModelMaxTokens as default,
	filterChatHistoryByMaxTokens,
	countTotalPromptTokens,
};
