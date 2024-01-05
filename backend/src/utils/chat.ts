import { ChatHistoryMessage } from '@src/models/chat';

// mutates the chat history
function pushMessageToHistory(
	chatHistory: ChatHistoryMessage[],
	newMessage: ChatHistoryMessage
) {
	// limit the length of the chat history
	const maxChatHistoryLength = 1000;

	// remove the oldest message, not including system role message
	// until the length of the chat history is less than maxChatHistoryLength
	while (chatHistory.length >= maxChatHistoryLength) {
		if (chatHistory[0].completion?.role !== 'system') {
			chatHistory.shift();
		} else {
			chatHistory.splice(1, 1);
		}
	}
	chatHistory.push(newMessage);
}

export { pushMessageToHistory };
