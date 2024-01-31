import { ChatCompletionSystemMessageParam } from 'openai/resources/chat/completions';

import { getSystemRole, isDefenceActive } from '@src/defence';
import { CHAT_MESSAGE_TYPE } from '@src/models/chat';
import { ChatMessage } from '@src/models/chatMessage';
import { DEFENCE_ID, Defence } from '@src/models/defence';
import { LEVEL_NAMES } from '@src/models/level';

function pushMessageToHistory(
	chatHistory: ChatMessage[],
	newMessage: ChatMessage
) {
	// limit the length of the chat history
	const maxChatHistoryLength = 1000;

	const existingSystemRole =
		chatHistory[0]?.chatMessageType === CHAT_MESSAGE_TYPE.SYSTEM
			? chatHistory[0]
			: null;

	const limitedHistoryStartIndex = Math.max(
		chatHistory.length - maxChatHistoryLength + 1,
		0
	);
	const updatedChatHistory = chatHistory.slice(
		limitedHistoryStartIndex,
		chatHistory.length
	);

	if (existingSystemRole) {
		updatedChatHistory[0] = existingSystemRole;
	}

	return updatedChatHistory.concat(newMessage);
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

		const existingSystemRole = chatHistory.find(
			(message) => message.chatMessageType === CHAT_MESSAGE_TYPE.SYSTEM
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
			return chatHistory.map((message) =>
				message.chatMessageType === CHAT_MESSAGE_TYPE.SYSTEM
					? ({
							...existingSystemRole,
							completion: completionConfig,
					  } as ChatMessage)
					: (message as ChatMessage)
			);
		}
	} else {
		return chatHistory.filter(
			(message) => message.chatMessageType !== CHAT_MESSAGE_TYPE.SYSTEM
		);
	}
}

export { pushMessageToHistory, setSystemRoleInChatHistory };
