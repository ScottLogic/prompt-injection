import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

import { filterChatHistoryByMaxTokens } from '@src/utils/token';

describe('token unit tests', () => {
	test('GIVEN chat history exceeds max token number WHEN applying filter THEN it should return the filtered chat history', () => {
		const maxTokens = 260; // 120 tokens for function call
		const chatHistory: ChatCompletionMessageParam[] = [
			{
				role: 'user',
				content: 'Hello, my name is Bob.',
			},

			{
				role: 'assistant',
				content: 'Hello Bob! How can I assist you today?',
			},
			{
				role: 'user',
				content: 'Send an email to my boss to tell him I quit.',
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
							name: 'sendEmail',
						},
					},
				],
			},
			{
				role: 'tool',
				content:
					'Email sent to boss with address bob@example.com and subject Resignation.',
				tool_call_id: 'tool_call_0',
			},

			{
				role: 'assistant',
				content: 'I have sent the email.',
			},
		];

		// expect that the first message is trimmed
		const expectedFilteredChatHistory: ChatCompletionMessageParam[] = [
			{
				role: 'assistant',
				content: 'Hello Bob! How can I assist you today?',
			},
			{
				role: 'user',
				content: 'Send an email to my boss to tell him I quit.',
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
							name: 'sendEmail',
						},
					},
				],
			},
			{
				role: 'tool',
				content:
					'Email sent to boss with address bob@example.com and subject Resignation.',
				tool_call_id: 'tool_call_0',
			},

			{
				role: 'assistant',
				content: 'I have sent the email.',
			},
		];

		const filteredChatHistory = filterChatHistoryByMaxTokens(
			chatHistory,
			maxTokens
		);

		expect(filteredChatHistory.length).toBe(5);
		expect(filteredChatHistory).toEqual(expectedFilteredChatHistory);
	});

	test('GIVEN chat history does not exceed max token number WHEN applying filter THEN it should return the original chat history', () => {
		const maxTokens = 1000;
		const chatHistory: ChatCompletionMessageParam[] = [
			{
				role: 'user',
				content: 'Hello, my name is Bob.',
			},

			{
				role: 'assistant',
				content: 'Hello, how are you?',
			},
			{
				role: 'user',
				content: 'Send an email to my boss to tell him I quit.',
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
							name: 'sendEmail',
						},
					},
				],
			},
			{
				role: 'assistant',
				content: 'I have sent the email.',
			},
		];

		const filteredChatHistory = filterChatHistoryByMaxTokens(
			chatHistory,
			maxTokens
		);
		expect(filteredChatHistory).toEqual(chatHistory);
	});

	test('GIVEN chat history exceeds max token number WHEN applying filter AND there is a system role in chat history THEN it should return the filtered chat history', () => {
		const maxTokens = 260;

		const chatHistory: ChatCompletionMessageParam[] = [
			{ role: 'system', content: 'You are a helpful chatbot.' },
			{
				role: 'user',
				content: 'Hello, my name is Bob.',
			},
			{
				role: 'assistant',
				content: 'Hello Bob! How can I assist you today?',
			},
			{
				role: 'user',
				content: 'Send an email to my boss to tell him I quit.',
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
							name: 'sendEmail',
						},
					},
				],
			},
			{
				role: 'tool',
				content:
					'Email sent to boss with address bob@example.com and subject Resignation.',
				tool_call_id: 'tool_call_0',
			},

			{
				role: 'assistant',
				content: 'I have sent the email.',
			},
		];

		// expect that the system message remains and the second two messages are removed
		const expectedFilteredChatHistory: ChatCompletionMessageParam[] = [
			{
				role: 'system',
				content: 'You are a helpful chatbot.',
			},
			{
				role: 'user',
				content: 'Send an email to my boss to tell him I quit.',
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
							name: 'sendEmail',
						},
					},
				],
			},
			{
				role: 'tool',
				content:
					'Email sent to boss with address bob@example.com and subject Resignation.',
				tool_call_id: 'tool_call_0',
			},

			{
				role: 'assistant',
				content: 'I have sent the email.',
			},
		];

		const filteredChatHistory = filterChatHistoryByMaxTokens(
			chatHistory,
			maxTokens
		);

		expect(filteredChatHistory.length).toBe(5);
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

	test('GIVEN the max tokens is reached on a tool call WHEN applying filter THEN it should remove the previous assistant reply to the tool call', () => {
		const maxTokens = 200; // 120 tokens for function call
		const chatHistory: ChatCompletionMessageParam[] = [
			{
				role: 'user',
				content: 'Send an email to my boss to tell him I quit.',
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
							name: 'sendEmail',
						},
					},
				],
			},
			{
				role: 'tool',
				content:
					'Email sent to boss with address bob@example.com and subject Resignation.',
				tool_call_id: 'tool_call_0',
			},

			{
				role: 'assistant',
				content: 'I have sent the email.',
			},
			{
				role: 'user',
				content: 'Thanks, lets talk about something else.',
			},
		];
		const reducedChatHistory: ChatCompletionMessageParam[] = [
			{
				role: 'assistant',
				content: 'I have sent the email.',
			},
			{
				role: 'user',
				content: 'Thanks, lets talk about something else.',
			},
		];

		const filteredChatHistory = filterChatHistoryByMaxTokens(
			chatHistory,
			maxTokens
		);
		expect(filteredChatHistory).toEqual(reducedChatHistory);
	});
});
