import { ChatCompletionSystemMessageParam } from 'openai/resources/chat/completions';

import { getSystemRole, isDefenceActive } from '@src/defence';
import { ChatMessage } from '@src/models/chatMessage';
import { DEFENCE_ID, Defence } from '@src/models/defence';
import { LEVEL_NAMES } from '@src/models/level';

function pushMessageToHistory(
	chatHistory: ChatMessage[],
	newMessage: ChatMessage
) {
	// limit the length of the chat history
	const maxChatHistoryLength = 1000;

	const updatedChatHistory = [...chatHistory, newMessage];
	const messagesToRemove = updatedChatHistory.length - maxChatHistoryLength;
	if (messagesToRemove < 1) return updatedChatHistory;

	const spliceFrom = updatedChatHistory[0].chatMessageType === 'SYSTEM' ? 1 : 0;
	updatedChatHistory.splice(spliceFrom, messagesToRemove);
	return updatedChatHistory;
}

function isSystemMessage(message: ChatMessage) {
	return message.chatMessageType === 'SYSTEM';
}

function setSystemRoleInChatHistory(
	currentLevel: LEVEL_NAMES,
	defences: Defence[],
	chatHistory: ChatMessage[]
): ChatMessage[] {
	const systemRoleNeededInChatHistory =
		currentLevel !== LEVEL_NAMES.SANDBOX ||
		isDefenceActive(DEFENCE_ID.SYSTEM_ROLE, defences);

	if (systemRoleNeededInChatHistory) {
		const completionConfig: ChatCompletionSystemMessageParam = {
			role: 'system',
			content: getSystemRole(defences, currentLevel),
		};

		const existingSystemRole = chatHistory.find(isSystemMessage);
		if (!existingSystemRole) {
			return [
				{
					completion: completionConfig,
					chatMessageType: 'SYSTEM',
				},
				...chatHistory,
			];
		} else {
			return chatHistory.map((message) =>
				isSystemMessage(message)
					? ({
							...existingSystemRole,
							completion: completionConfig,
					  } as ChatMessage)
					: message
			);
		}
	} else {
		return chatHistory.filter((message) => !isSystemMessage(message));
	}
}

export { pushMessageToHistory, setSystemRoleInChatHistory };
