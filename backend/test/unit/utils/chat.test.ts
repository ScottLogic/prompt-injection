import { CHAT_MESSAGE_TYPE, ChatHistoryMessage } from '@src/models/chat';
import { pushMessageToHistory } from '@src/utils/chat';

describe('chat utils unit tests', () => {
	const maxChatHistoryLength = 1000;
	const systemRoleMessage: ChatHistoryMessage = {
		completion: {
			role: 'system',
			content: 'You are an AI.',
		},
		chatMessageType: CHAT_MESSAGE_TYPE.SYSTEM,
	};
	const generalChatMessage: ChatHistoryMessage = {
		completion: {
			role: 'user',
			content: 'hello world',
		},
		chatMessageType: CHAT_MESSAGE_TYPE.USER,
	};

	test(
		'GIVEN no chat history ' +
			'WHEN adding a new chat message ' +
			'THEN new message is added',
		() => {
			const chatHistory: ChatHistoryMessage[] = [];
			pushMessageToHistory(chatHistory, generalChatMessage);
			expect(chatHistory.length).toBe(1);
			expect(chatHistory[0]).toEqual(generalChatMessage);
		}
	);

	test(
		'GIVEN chat history with length < maxChatHistoryLength ' +
			'WHEN adding a new chat message ' +
			'THEN new message is added',
		() => {
			const chatHistory: ChatHistoryMessage[] = [generalChatMessage];
			pushMessageToHistory(chatHistory, generalChatMessage);
			expect(chatHistory.length).toBe(2);
			expect(chatHistory[1]).toEqual(generalChatMessage);
		}
	);

	test(
		"GIVEN chat history with length === maxChatHistoryLength AND there's no system role" +
			'WHEN adding a new chat message ' +
			'THEN new message is added AND the oldest message is removed',
		() => {
			const chatHistory: ChatHistoryMessage[] = new Array<ChatHistoryMessage>(
				maxChatHistoryLength
			).fill(generalChatMessage);
			pushMessageToHistory(chatHistory, generalChatMessage);
			expect(chatHistory.length).toBe(maxChatHistoryLength);
			expect(chatHistory[0]).toEqual(generalChatMessage);
			expect(chatHistory[chatHistory.length - 1]).toEqual(generalChatMessage);
		}
	);

	test(
		'GIVEN chat history with length === maxChatHistoryLength AND the oldest message is a system role message ' +
			'WHEN adding a new chat message ' +
			'THEN new message is added AND the oldest non-system-role message is removed',
		() => {
			const chatHistory: ChatHistoryMessage[] = new Array<ChatHistoryMessage>(
				maxChatHistoryLength
			).fill(generalChatMessage);
			chatHistory[0] = systemRoleMessage;
			pushMessageToHistory(chatHistory, generalChatMessage);
			expect(chatHistory.length).toBe(maxChatHistoryLength);
			expect(chatHistory[0]).toEqual(systemRoleMessage);
			expect(chatHistory[chatHistory.length - 1]).toEqual(generalChatMessage);
		}
	);

	test(
		"GIVEN chat history with length > maxChatHistoryLength AND there's no system role" +
			'WHEN adding a new chat message ' +
			'THEN new message is added AND the oldest messages are removed until the length is maxChatHistoryLength',
		() => {
			const chatHistory: ChatHistoryMessage[] = new Array<ChatHistoryMessage>(
				maxChatHistoryLength + 1
			).fill(generalChatMessage);
			pushMessageToHistory(chatHistory, generalChatMessage);
			expect(chatHistory.length).toBe(maxChatHistoryLength);
			expect(chatHistory[0]).toEqual(generalChatMessage);
			expect(chatHistory[chatHistory.length - 1]).toEqual(generalChatMessage);
		}
	);

	test(
		'GIVEN chat history with length > maxChatHistoryLength AND the oldest message is a system role message ' +
			'WHEN adding a new chat message ' +
			'THEN new message is added AND the oldest non-system-role messages are removed until the length is maxChatHistoryLength',
		() => {
			const chatHistory: ChatHistoryMessage[] = new Array<ChatHistoryMessage>(
				maxChatHistoryLength + 1
			).fill(generalChatMessage);
			chatHistory[0] = systemRoleMessage;
			pushMessageToHistory(chatHistory, generalChatMessage);
			expect(chatHistory.length).toBe(maxChatHistoryLength);
			expect(chatHistory[0]).toEqual(systemRoleMessage);
			expect(chatHistory[chatHistory.length - 1]).toEqual(generalChatMessage);
		}
	);
});
