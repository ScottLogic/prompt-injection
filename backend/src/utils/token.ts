import { OpenAI } from 'openai';
import {
	ChatCompletionMessage,
	ChatCompletionMessageParam,
} from 'openai/resources/chat/completions';
import { promptTokensEstimate } from 'openai-chat-tokens';

import { CHAT_MODELS } from '@src/models/chat';
import { chatGptTools } from '@src/openai';
import { get_encoding, encoding_for_model } from "@dqbd/tiktoken";

// max tokens each model can use
const chatModelMaxTokens = {
	[CHAT_MODELS.GPT_4_TURBO]: 128000,
	[CHAT_MODELS.GPT_4]: 8191,
	[CHAT_MODELS.GPT_4_0613]: 8191,
	[CHAT_MODELS.GPT_3_5_TURBO]: 600, // todo - change to 4095 
	[CHAT_MODELS.GPT_3_5_TURBO_0613]: 4095,
	[CHAT_MODELS.GPT_3_5_TURBO_16K]: 16384,
	[CHAT_MODELS.GPT_3_5_TURBO_16K_0613]: 16384,
};


function countTokensForMessage(message: ChatCompletionMessageParam) {
	encoding = tiktoken.encodings.encode(message.text);

}



function toolCallFunctionCount(
	toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall.Function[]
) {
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
	}
	console.debug('tokenInfo= tool call count = ', estLTokens);
	return estLTokens;
}

function toolCallFunctionCount2(
	toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall.Function[]

) {
	// convert tool calls to function calls
	

});


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
				return toolCallFunctionCount(toolCalls);
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

	console.debug('tokenInfo= estimatedTotalTokens= ', estimatedTokens);

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

		console.log('tokenInfo= message: ', element, 'numTokens=', numTokens);
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

export {
	chatModelMaxTokens,
	filterChatHistoryByMaxTokens,
	toolCallFunctionCount,
};
