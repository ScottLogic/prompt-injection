import { ChatCompletionSystemMessageParam } from 'openai/resources/chat/completions';

import { getSystemRole, isDefenceActive } from '@src/defence';
import { CHAT_MESSAGE_TYPE, ChatHistoryMessage } from '@src/models/chat';
import { DEFENCE_ID, Defence } from '@src/models/defence';
import { LEVEL_NAMES } from '@src/models/level';

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

function setSystemRoleInChatHistory(
	currentLevel: LEVEL_NAMES,
	defences: Defence[],
	chatHistory: ChatHistoryMessage[]
) {
	const systemRoleNeededInChatHistory =
		currentLevel !== LEVEL_NAMES.SANDBOX ||
		isDefenceActive(DEFENCE_ID.SYSTEM_ROLE, defences);

	if (systemRoleNeededInChatHistory) {
		const completionConfig: ChatCompletionSystemMessageParam = {
			role: 'system',
			content: getSystemRole(defences, currentLevel),
		};

		const existingSystemRole = chatHistory.find(
			(message) => message.completion?.role === 'system'
		);
		if (!existingSystemRole) {
			return [
				{
					completion: completionConfig,
					chatMessageType: CHAT_MESSAGE_TYPE.SYSTEM,
				},
				...chatHistory,
			];
		} else {
			return chatHistory.map((message) => {
				if (message.completion?.role === 'system') {
					return { ...existingSystemRole, completion: completionConfig };
				} else {
					return message;
				}
			});
		}
	} else {
		return chatHistory.filter(
			(message) => message.completion?.role !== 'system'
		);
	}
}

export { pushMessageToHistory, setSystemRoleInChatHistory };
