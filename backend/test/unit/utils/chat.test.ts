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
			const updatedChatHistory = pushMessageToHistory(
				chatHistory,
				generalChatMessage
			);
			expect(updatedChatHistory.length).toBe(1);
			expect(updatedChatHistory[0]).toEqual(generalChatMessage);
		}
	);

	test(
		'GIVEN chat history with length < maxChatHistoryLength ' +
			'WHEN adding a new chat message ' +
			'THEN new message is added',
		() => {
			const chatHistory: ChatHistoryMessage[] = [generalChatMessage];
			const updatedChatHistory = pushMessageToHistory(
				chatHistory,
				generalChatMessage
			);
			expect(updatedChatHistory.length).toBe(2);
			expect(updatedChatHistory[1]).toEqual(generalChatMessage);
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
			const updatedChatHistory = pushMessageToHistory(
				chatHistory,
				generalChatMessage
			);
			expect(updatedChatHistory.length).toBe(maxChatHistoryLength);
			expect(updatedChatHistory[0]).toEqual(generalChatMessage);
			expect(updatedChatHistory[updatedChatHistory.length - 1]).toEqual(
				generalChatMessage
			);
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
			const updatedChatHistory = pushMessageToHistory(
				chatHistory,
				generalChatMessage
			);
			expect(updatedChatHistory.length).toBe(maxChatHistoryLength);
			expect(updatedChatHistory[0]).toEqual(systemRoleMessage);
			expect(updatedChatHistory[updatedChatHistory.length - 1]).toEqual(
				generalChatMessage
			);
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
			const updatedChatHistory = pushMessageToHistory(
				chatHistory,
				generalChatMessage
			);
			expect(updatedChatHistory.length).toBe(maxChatHistoryLength);
			expect(updatedChatHistory[0]).toEqual(generalChatMessage);
			expect(updatedChatHistory[updatedChatHistory.length - 1]).toEqual(
				generalChatMessage
			);
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
			const updatedChatHistory = pushMessageToHistory(
				chatHistory,
				generalChatMessage
			);
			expect(updatedChatHistory.length).toBe(maxChatHistoryLength);
			expect(updatedChatHistory[0]).toEqual(systemRoleMessage);
			expect(updatedChatHistory[updatedChatHistory.length - 1]).toEqual(
				generalChatMessage
			);
		}
	);
});
