import {
	ChatCompletionMessageParam,
	ChatCompletionMessageToolCall,
} from 'openai/resources/chat/completions';
import { promptTokensEstimate, stringTokens } from 'openai-chat-tokens';

import { chatModelTools } from '@src/openai';

const TOKENS_PER_TOOL_CALL = 4;
const OFFSET_OPENAI_TOKENS = 5; // there is an offset of 5 between openai completion prompt_tokens

function countSingleToolCallTokens(toolCall: ChatCompletionMessageToolCall[]) {
	return toolCall.reduce((acc, toolCall) => {
		const {
			function: { name, arguments: args },
		} = toolCall;
		return acc + stringTokens(name) + stringTokens(args);
	}, 0);
}

// count total tool call in chat history as not supported by openai-chat-tokens yet. To be removed when supported by package
function countToolCallTokens(chatHistory: ChatCompletionMessageParam[]) {
	let numToolCalls = 0;
	let tokens = 0;
	for (const message of chatHistory) {
		if (message.role === 'assistant' && message.tool_calls) {
			numToolCalls += message.tool_calls.length;
			tokens += countSingleToolCallTokens(message.tool_calls);
		}
	}
	return tokens + numToolCalls * TOKENS_PER_TOOL_CALL;
}

function countTotalPromptTokens(chatHistory: ChatCompletionMessageParam[]) {
	return (
		promptTokensEstimate({
			messages: chatHistory,
			functions: chatModelTools.map((tool) => tool.function),
		}) +
		countToolCallTokens(chatHistory) +
		OFFSET_OPENAI_TOKENS
	);
}

function truncateChatHistoryToContextWindow(
	chatHistory: ChatCompletionMessageParam[],
	contextWindowSize: number
): ChatCompletionMessageParam[] {
	if (chatHistory.length === 0) {
		return chatHistory;
	}
	const estimatedTokens = countTotalPromptTokens(chatHistory);
	if (estimatedTokens <= contextWindowSize) {
		return chatHistory;
	}
	console.log(
		'Truncating chat history to fit inside context window:',
		`estimated_tokens=${estimatedTokens} context_window=${contextWindowSize}`
	);
	const newList: ChatCompletionMessageParam[] = [];

	// reverse list to add from most recent
	const reverseHistory = chatHistory.slice().reverse();
	// always add first message
	newList.push(reverseHistory[0]);

	// add the system role if it's there
	if (chatHistory[0].role === 'system') {
		newList.push(chatHistory[0]);
	}

	// add elements after first message until max tokens reached
	for (let i = 1; i < reverseHistory.length; i++) {
		const message = reverseHistory[i];
		// if we reach end and system role is there skip as it's already been added
		if (message.role === 'system') {
			continue;
		}
		// create a temp list to test if message fits inside max tokens
		const tempList = newList.slice();
		tempList.splice(i, 0, message);

		const currentTokens = countTotalPromptTokens(tempList);
		// if it fits add it to the list
		if (currentTokens <= contextWindowSize) {
			newList.splice(i, 0, message);
		} else {
			console.debug('Max tokens reached on completion=', message);
			// if message is a tool_call, remove the previous assistant reply to the tool call
			// as will throw an error when there is a lone tool_call_id
			if (message.role === 'assistant' && message.tool_calls) {
				newList.splice(i - 1, 1);
			}
			break;
		}
	}
	return newList.reverse();
}

export { truncateChatHistoryToContextWindow, countTotalPromptTokens };
