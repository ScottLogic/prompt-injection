import { CHAT_MESSAGE_TYPE, ChatMessage } from '@src/models/chat';

import './ChatBoxMessage.css';

function ChatBoxMessageWithoutAvatar({ message }: { message: ChatMessage }) {
	return (
		<div
			className={
				message.type === CHAT_MESSAGE_TYPE.LEVEL_INFO
					? 'chat-box-message chat-box-message-level-info'
					: message.type === CHAT_MESSAGE_TYPE.USER
					? 'chat-box-message chat-box-message-user'
					: message.type === CHAT_MESSAGE_TYPE.USER_TRANSFORMED
					? 'chat-box-message chat-box-message-user chat-box-message-user-transformed'
					: message.type === CHAT_MESSAGE_TYPE.ERROR_MSG
					? 'chat-box-message chat-box-message-error'
					: message.type === CHAT_MESSAGE_TYPE.BOT
					? 'chat-box-message chat-box-message-ai'
					: 'chat-box-message chat-box-message-ai chat-box-message-ai-blocked'
			}
			lang="en"
		>
			{message.type === CHAT_MESSAGE_TYPE.USER_TRANSFORMED && (
				<b>Transformed: </b>
			)}
			{message.type === CHAT_MESSAGE_TYPE.LEVEL_INFO && (
				<p className="level-info-header">Information</p>
			)}
			{message.message}
		</div>
	);
}

export default ChatBoxMessageWithoutAvatar;
