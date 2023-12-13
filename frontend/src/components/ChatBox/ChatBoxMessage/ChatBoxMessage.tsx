import { CHAT_MESSAGE_TYPE, ChatMessage } from '@src/models/chat';

import ChatBoxMessageWithAvatar from './ChatBoxMessageWithAvatar';
import ChatBoxMessageWithoutAvatar from './ChatBoxMessageWithoutAvatar';

import './ChatBoxMessage.css';

function ChatBoxMessage({ message }: { message: ChatMessage }) {
	const ChatBoxMessageElement =
		message.type === CHAT_MESSAGE_TYPE.USER
			? ChatBoxMessageWithAvatar
			: ChatBoxMessageWithoutAvatar;
	return <ChatBoxMessageElement message={message} />;
}

export default ChatBoxMessage;
