import { ChatHistoryMessage } from '@src/models/chat';

function pushMessageToHistory(
	chatHistory: ChatHistoryMessage[],
	newMessage: ChatHistoryMessage
) {
	// limit the length of the chat history
	const maxChatHistoryLength = 1000;
	const updatedChatHistory = [...chatHistory];

	// remove the oldest message, not including system role message
	// until the length of the chat history is less than maxChatHistoryLength
	while (updatedChatHistory.length >= maxChatHistoryLength) {
		if (updatedChatHistory[0].completion?.role !== 'system') {
			updatedChatHistory.shift();
		} else {
			updatedChatHistory.splice(1, 1);
		}
	}
	updatedChatHistory.push(newMessage);
	return updatedChatHistory;
}

export { pushMessageToHistory };
