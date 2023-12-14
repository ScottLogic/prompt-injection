import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

import { filterChatHistoryByMaxTokens } from '@src/utils/token';

describe('token unit tests', () => {
	test('GIVEN chat history exceeds max token number WHEN applying filter THEN it should return the filtered chat history', () => {
		const maxTokens = 121;
		const chatHistory: ChatCompletionMessageParam[] = [
			{
				role: 'user',
				content: 'Hello, my name is Bob.', // 14 tokens
			},

			{
				role: 'assistant',
				content: 'Hello, how are you?', // 13 tokens
			},
			{
				role: 'user',
				content: 'Send an email to my boss to tell him I quit.', // 19 tokens
			},
			{
				role: 'assistant',
				content: null,
				tool_calls: [
					{
						id: 'tool_call_0',
						type: 'function',
						function: {
							arguments:
								'{\n  "address": "boss@example.com",\n  "subject": "Resignation",\n  "body": "Dear Boss, \\n\\nI am writing to formally resign from my position at the company, effective immediately. \\n\\nBest regards, \\nBob",\n  "confirmed": true\n}',
							name: 'sendEmail', // 75 tokens }
						},
					},
				],
			},

			{
				role: 'assistant',
				content: 'I have sent the email.', // 13 tokens
			},
		];

		// expect that the first message is trimmed
		const expectedFilteredChatHistory: ChatCompletionMessageParam[] = [
			{
				role: 'assistant',
				content: 'Hello, how are you?', // 12 tokens
			},
			{
				role: 'user',
				content: 'Send an email to my boss to tell him I quit.', // 19 tokens
			},
			{
				role: 'assistant',
				content: null,
				tool_calls: [
					{
						id: 'tool_call_0',
						type: 'function',
						function: {
							arguments:
								'{\n  "address": "boss@example.com",\n  "subject": "Resignation",\n  "body": "Dear Boss, \\n\\nI am writing to formally resign from my position at the company, effective immediately. \\n\\nBest regards, \\nBob",\n  "confirmed": true\n}',
							name: 'sendEmail', // 75 tokens }
						},
					},
				],
			},
			{
				role: 'assistant',
				content: 'I have sent the email.', // 6 tokens
			},
		];

		const filteredChatHistory = filterChatHistoryByMaxTokens(
			chatHistory,
			maxTokens
		);

		expect(filteredChatHistory.length).toBe(4);
		expect(filteredChatHistory).toEqual(expectedFilteredChatHistory);
	});

	test('GIVEN chat history does not exceed max token number WHEN applying filter THEN it should return the original chat history', () => {
		const maxTokens = 1000;
		const chatHistory: ChatCompletionMessageParam[] = [
			{
				role: 'user',
				content: 'Hello, my name is Bob.', // 14 tokens
			},

			{
				role: 'assistant',
				content: 'Hello, how are you?', // 13 tokens
			},
			{
				role: 'user',
				content: 'Send an email to my boss to tell him I quit.', // 19 tokens
			},
			{
				role: 'assistant',
				content: null,
				tool_calls: [
					{
						id: 'tool_call_0',
						type: 'function',
						function: {
							arguments:
								'{\n  "address": "boss@example.com",\n  "subject": "Resignation",\n  "body": "Dear Boss, \\n\\nI am writing to formally resign from my position at the company, effective immediately. \\n\\nBest regards, \\nBob",\n  "confirmed": true\n}',
							name: 'sendEmail', // 75 tokens }
						},
					},
				],
			},
			{
				role: 'assistant',
				content: 'I have sent the email.', // 13 tokens
			},
		];

		const filteredChatHistory = filterChatHistoryByMaxTokens(
			chatHistory,
			maxTokens
		);
		expect(filteredChatHistory).toEqual(chatHistory);
	});

	test('GIVEN chat history exceeds max token number WHEN applying filter AND there is a system role in chat history THEN it should return the filtered chat history', () => {
		const maxTokens = 121;

		const chatHistory: ChatCompletionMessageParam[] = [
			{
				role: 'system',
				content: 'You are a helpful chatbot.', // 14 tokens
			},
			{
				role: 'user',
				content: 'Hello, my name is Bob.', // 14 tokens
			},

			{
				role: 'assistant',
				content: 'Hello, how are you?', // 13 tokens
			},
			{
				role: 'user',
				content: 'Send an email to my boss to tell him I quit.', // 19 tokens
			},
			{
				role: 'assistant',
				content: null,
				tool_calls: [
					{
						id: 'tool_call_0',
						type: 'function',
						function: {
							arguments:
								'{\n  "address": "boss@example.com",\n  "subject": "Resignation",\n  "body": "Dear Boss, \\n\\nI am writing to formally resign from my position at the company, effective immediately. \\n\\nBest regards, \\nBob",\n  "confirmed": true\n}',
							name: 'sendEmail', // 75 tokens }
						},
					},
				],
			},
			{
				role: 'assistant',
				content: 'I have sent the email.', // 13 tokens
			},
		];

		// expect that the first message is trimmed
		const expectedFilteredChatHistory: ChatCompletionMessageParam[] = [
			{
				role: 'system',
				content: 'You are a helpful chatbot.', // 14 tokens
			},
			{
				role: 'user',
				content: 'Send an email to my boss to tell him I quit.', // 19 tokens
			},
			{
				role: 'assistant',
				content: null,
				tool_calls: [
					{
						id: 'tool_call_0',
						type: 'function',
						function: {
							arguments:
								'{\n  "address": "boss@example.com",\n  "subject": "Resignation",\n  "body": "Dear Boss, \\n\\nI am writing to formally resign from my position at the company, effective immediately. \\n\\nBest regards, \\nBob",\n  "confirmed": true\n}',
							name: 'sendEmail', // 75 tokens }
						},
					},
				],
			},
			{
				role: 'assistant',
				content: 'I have sent the email.', // 6 tokens
			},
		];

		const filteredChatHistory = filterChatHistoryByMaxTokens(
			chatHistory,
			maxTokens
		);

		expect(filteredChatHistory.length).toBe(4);
		expect(filteredChatHistory).toEqual(expectedFilteredChatHistory);
	});

	test('GIVEN chat history most recent message exceeds max tokens alone WHEN applying filter THEN it should return this message', () => {
		const maxTokens = 30;
		const chatHistory: ChatCompletionMessageParam[] = [
			{
				role: 'user',
				content:
					'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ',
			},
		];
		const filteredChatHistory = filterChatHistoryByMaxTokens(
			chatHistory,
			maxTokens
		);
		expect(filteredChatHistory).toEqual(chatHistory);
	});
});
