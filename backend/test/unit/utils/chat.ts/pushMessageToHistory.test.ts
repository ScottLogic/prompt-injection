import { expect, test } from '@jest/globals';

import {} from '@src/models/chat';
import { ChatMessage } from '@src/models/chatMessage';
import { pushMessageToHistory } from '@src/utils/chat';

const maxChatHistoryLength = 1000;
const systemRoleMessage: ChatMessage = {
	completion: {
		role: 'system',
		content: 'You are an AI.',
	},
	chatMessageType: 'SYSTEM',
};
const generalChatMessage: ChatMessage = {
	completion: {
		role: 'user',
		content: 'hello world',
	},
	chatMessageType: 'USER',
};

test('GIVEN no chat history WHEN adding a new chat message THEN new message is added', () => {
	const chatHistory: ChatMessage[] = [];
	const updatedChatHistory = pushMessageToHistory(
		chatHistory,
		generalChatMessage
	);
	expect(updatedChatHistory.length).toBe(1);
	expect(updatedChatHistory[0]).toEqual(generalChatMessage);
});

test('GIVEN chat history with length < maxChatHistoryLength WHEN adding a new chat message THEN new message is added', () => {
	const chatHistory: ChatMessage[] = [generalChatMessage];
	const updatedChatHistory = pushMessageToHistory(
		chatHistory,
		generalChatMessage
	);
	expect(updatedChatHistory.length).toBe(2);
	expect(updatedChatHistory[1]).toEqual(generalChatMessage);
});

test("GIVEN chat history with length === maxChatHistoryLength AND there's no system role WHEN adding a new chat message THEN new message is added AND the oldest message is removed", () => {
	const chatHistory: ChatMessage[] = new Array<ChatMessage>(
		maxChatHistoryLength
	).fill(generalChatMessage);
	const updatedChatHistory = pushMessageToHistory(
		chatHistory,
		generalChatMessage
	);
	expect(updatedChatHistory.length).toBe(maxChatHistoryLength);
	expect(updatedChatHistory[0]).toEqual(generalChatMessage);
	expect(updatedChatHistory[updatedChatHistory.length - 1]).toEqual(
		generalChatMessage
	);
});

test('GIVEN chat history with length === maxChatHistoryLength AND the oldest message is a system role message WHEN adding a new chat message THEN new message is added AND the oldest non-system-role message is removed', () => {
	const chatHistory: ChatMessage[] = new Array<ChatMessage>(
		maxChatHistoryLength
	).fill(generalChatMessage);
	chatHistory[0] = systemRoleMessage;
	const updatedChatHistory = pushMessageToHistory(
		chatHistory,
		generalChatMessage
	);
	expect(updatedChatHistory.length).toBe(maxChatHistoryLength);
	expect(updatedChatHistory[0]).toEqual(systemRoleMessage);
	expect(updatedChatHistory[updatedChatHistory.length - 1]).toEqual(
		generalChatMessage
	);
});

test("GIVEN chat history with length > maxChatHistoryLength AND there's no system role WHEN adding a new chat message THEN new message is added AND the oldest messages are removed until the length is maxChatHistoryLength", () => {
	const chatHistory: ChatMessage[] = new Array<ChatMessage>(
		maxChatHistoryLength + 1
	).fill(generalChatMessage);
	const updatedChatHistory = pushMessageToHistory(
		chatHistory,
		generalChatMessage
	);
	expect(updatedChatHistory.length).toBe(maxChatHistoryLength);
	expect(updatedChatHistory[0]).toEqual(generalChatMessage);
	expect(updatedChatHistory[updatedChatHistory.length - 1]).toEqual(
		generalChatMessage
	);
});

test('GIVEN chat history with length > maxChatHistoryLength AND the oldest message is a system role message WHEN adding a new chat message THEN new message is added AND the oldest non-system-role messages are removed until the length is maxChatHistoryLength', () => {
	const chatHistory: ChatMessage[] = new Array<ChatMessage>(
		maxChatHistoryLength + 1
	).fill(generalChatMessage);
	chatHistory[0] = systemRoleMessage;
	const updatedChatHistory = pushMessageToHistory(
		chatHistory,
		generalChatMessage
	);
	expect(updatedChatHistory.length).toBe(maxChatHistoryLength);
	expect(updatedChatHistory[0]).toEqual(systemRoleMessage);
	expect(updatedChatHistory[updatedChatHistory.length - 1]).toEqual(
		generalChatMessage
	);
});
