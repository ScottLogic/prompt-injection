import { afterEach, describe, expect, jest, test } from '@jest/globals';
import {
	ChatCompletion,
	ChatCompletionAssistantMessageParam,
	ChatCompletionCreateParamsNonStreaming,
	ChatCompletionMessageToolCall,
} from 'openai/resources/chat/completions';

import { queryDocuments } from '@src/langchain';
import { ChatModel } from '@src/models/chat';
import { ChatMessage, ChatCompletionMessage } from '@src/models/chatMessage';
import { EmailInfo } from '@src/models/email';
import {
	FunctionAskQuestionParams,
	FunctionSendEmailParams,
} from '@src/models/openai';
import { chatModelSendMessage } from '@src/openai';

jest.mock('@src/langchain');

const mockChatCompletionCreate =
	jest.fn<
		(params: ChatCompletionCreateParamsNonStreaming) => Promise<ChatCompletion>
	>();

jest.mock('openai', () => ({
	OpenAI: jest.fn().mockImplementation(() => ({
		chat: {
			completions: {
				create: mockChatCompletionCreate,
			},
		},
	})),
}));

function chatCompletionResponse(
	content: string | null = null,
	toolCalls?: ChatCompletionMessageToolCall[]
): ChatCompletion {
	return {
		id: 'wotever',
		created: 123456789,
		model: 'any-model',
		object: 'chat.completion',
		choices: [
			{
				index: 0,
				logprobs: null,
				finish_reason: 'stop',
				message: {
					role: 'assistant',
					content,
					tool_calls: toolCalls,
				},
			},
		],
	};
}

function verifyHistoryWithToolCalls({
	originalChatHistory,
	updatedChatHistory,
	toolResponses,
}: {
	originalChatHistory: ChatMessage[];
	updatedChatHistory: ChatCompletionMessage[];
	toolResponses: string[];
}) {
	// Original history is preserved
	expect(updatedChatHistory.slice(0, originalChatHistory.length)).toEqual(
		originalChatHistory
	);

	// First added message is 'assistant' completion before tool calls are made
	const assistantMessage = updatedChatHistory[originalChatHistory.length];
	expect(assistantMessage.chatMessageType).toEqual('FUNCTION_CALL');
	expect(assistantMessage.completion?.content).toBeNull();
	expect(
		(assistantMessage.completion as ChatCompletionAssistantMessageParam)
			.tool_calls
	).toHaveLength(toolResponses.length);

	// Verify ALL tool call responses are added to history
	const toolCallMessages = updatedChatHistory.slice(
		originalChatHistory.length + 1
	);
	expect(toolCallMessages).toHaveLength(toolResponses.length);
	toolCallMessages.forEach((toolCall, index) => {
		expect(toolCall.chatMessageType).toEqual('FUNCTION_CALL');
		expect(toolCall.completion?.content).toEqual(toolResponses[index]);
	});
}

describe('chatModelSendMessage', () => {
	const chatModel: ChatModel = {
		id: 'gpt-3.5-turbo',
		configuration: {
			temperature: 1,
			topP: 1,
			frequencyPenalty: 0,
			presencePenalty: 0,
		},
	};
	const originalChatHistory: ChatMessage[] = [
		{
			chatMessageType: 'USER',
			completion: {
				role: 'user',
				content: 'Hi!',
			},
		},
	];

	afterEach(() => {
		mockChatCompletionCreate.mockReset();
	});

	test('WHEN message sent AND no tool calls triggered THEN reply is returned AND history unchanged', async () => {
		const expectedReply = 'Hello, how may I help you today?';
		mockChatCompletionCreate.mockResolvedValueOnce(
			chatCompletionResponse(expectedReply)
		);

		const reply = await chatModelSendMessage(originalChatHistory, chatModel);

		expect(reply.chatResponse.completion?.content).toBe(expectedReply);
		expect(reply.chatResponse.openAIErrorMessage).toBeNull();
		expect(reply.chatHistory).toEqual(originalChatHistory);
		expect(reply.sentEmails).toHaveLength(0);
	});

	test('WHEN message sent AND question tool_calls triggered THEN all answers are returned AND history updated', async () => {
		const questionOne = 'Are you lonesome tonight?';
		const answerOne = 'Yes!';
		const questionTwo = 'Will you still love me tomorrow?';
		const answerTwo = 'No!';

		jest
			.mocked(queryDocuments)
			.mockImplementation((question: string) =>
				Promise.resolve(
					question === questionOne
						? answerOne
						: question === questionTwo
							? answerTwo
							: 'UNEXPECTED QUESTION!'
				)
			);

		mockChatCompletionCreate
			.mockResolvedValueOnce(
				chatCompletionResponse(null, [
					{
						id: 'any-old-id',
						type: 'function',
						function: {
							name: 'askQuestion',
							arguments: JSON.stringify({
								question: questionOne,
							} as FunctionAskQuestionParams),
						},
					},
					{
						id: 'another-id',
						type: 'function',
						function: {
							name: 'askQuestion',
							arguments: JSON.stringify({
								question: questionTwo,
							} as FunctionAskQuestionParams),
						},
					},
				])
			)
			.mockImplementation((params) => {
				const { messages } = params;
				const latestChatMessage = messages.at(
					-1
				) as ChatCompletionAssistantMessageParam;
				return Promise.resolve(
					chatCompletionResponse(
						latestChatMessage.content ?? 'COMPLETION UNEXPECTEDLY EMPTY!'
					)
				);
			});

		const reply = await chatModelSendMessage(originalChatHistory, chatModel);

		// Ultimate response is the result of the final question tool_call.
		expect(reply.chatResponse.completion?.content).toEqual(answerTwo);
		expect(reply.chatResponse.openAIErrorMessage).toBeNull();
		expect(reply.sentEmails).toHaveLength(0);

		// Check history is updated with all expected function calls
		verifyHistoryWithToolCalls({
			originalChatHistory,
			updatedChatHistory: reply.chatHistory as ChatCompletionMessage[],
			toolResponses: [answerOne, answerTwo],
		});
	});

	test('WHEN message sent AND email tool_calls triggered THEN all emails are returned AND history updated', async () => {
		const emailOne: EmailInfo = {
			address: 'one@example.com',
			subject: 'stop',
			body: 'hammer time!',
		};
		const emailTwo: EmailInfo = {
			address: 'two@example.com',
			subject: 'yo stop',
			body: 'collaborate and listen',
		};
		const expectedToolReplyOne = `Email sent to ${emailOne.address} with subject ${emailOne.subject} and body ${emailOne.body}`;
		const expectedToolReplyTwo = `Email sent to ${emailTwo.address} with subject ${emailTwo.subject} and body ${emailTwo.body}`;

		mockChatCompletionCreate
			.mockResolvedValueOnce(
				chatCompletionResponse(null, [
					{
						id: 'any-old-id',
						type: 'function',
						function: {
							name: 'sendEmail',
							arguments: JSON.stringify({
								...emailOne,
								confirmed: true,
							} as FunctionSendEmailParams),
						},
					},
					{
						id: 'another-id',
						type: 'function',
						function: {
							name: 'sendEmail',
							arguments: JSON.stringify({
								...emailTwo,
								confirmed: true,
							} as FunctionSendEmailParams),
						},
					},
				])
			)
			.mockImplementation(({ messages }) => {
				const latest = messages.at(-1) as ChatCompletionAssistantMessageParam;
				return Promise.resolve(
					chatCompletionResponse(latest.content ?? 'WHOOPS NOT EXPECTED!')
				);
			});

		const reply = await chatModelSendMessage(originalChatHistory, chatModel);

		// Ultimate response is the result of the final email tool_call.
		expect(reply.chatResponse.completion?.content).toEqual(
			expectedToolReplyTwo
		);
		expect(reply.chatResponse.openAIErrorMessage).toBeNull();
		expect(reply.sentEmails).toEqual([emailOne, emailTwo]);

		// Check history is updated with all expected function calls
		verifyHistoryWithToolCalls({
			originalChatHistory,
			updatedChatHistory: reply.chatHistory as ChatCompletionMessage[],
			toolResponses: [expectedToolReplyOne, expectedToolReplyTwo],
		});
	});

	test('WHEN message sent AND error thrown THEN error message is returned AND history unchanged', async () => {
		const expectedError = 'Whoops AI gone pop bang';
		mockChatCompletionCreate.mockRejectedValueOnce(new Error(expectedError));

		const reply = await chatModelSendMessage(originalChatHistory, chatModel);

		expect(reply.chatResponse.completion).toBeNull();
		expect(reply.chatResponse.openAIErrorMessage).toEqual(expectedError);
		expect(reply.chatHistory).toEqual(originalChatHistory);
		expect(reply.sentEmails).toHaveLength(0);
	});
});
