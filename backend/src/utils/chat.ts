import { CHAT_MESSAGE_TYPE } from '@src/models/chat';
import { ChatMessage } from '@src/models/chatMessage';

function pushMessageToHistory(
	chatHistory: ChatMessage[],
	newMessage: ChatMessage
) {
	// limit the length of the chat history
	const maxChatHistoryLength = 1000;
	const updatedChatHistory = [...chatHistory];

	// remove the oldest message, not including system role message
	// until the length of the chat history is less than maxChatHistoryLength
	while (updatedChatHistory.length >= maxChatHistoryLength) {
		if (updatedChatHistory[0].chatMessageType === CHAT_MESSAGE_TYPE.SYSTEM) {
			updatedChatHistory.shift();
		} else {
			updatedChatHistory.splice(1, 1);
		}
	}
	updatedChatHistory.push(newMessage);
	return updatedChatHistory;
}

export { pushMessageToHistory };
