import { CHAT_MESSAGE_TYPE, ChatMessage } from '@src/models/chat';

import './ChatBoxMessage.css';

function ChatBoxMessage({ message }: { message: ChatMessage }) {
	return (
		<section
			className={
				message.type === CHAT_MESSAGE_TYPE.LEVEL_INFO
					? 'chat-box-message level-info'
					: message.type === CHAT_MESSAGE_TYPE.USER
					? 'chat-box-message user'
					: message.type === CHAT_MESSAGE_TYPE.USER_TRANSFORMED
					? 'chat-box-message user transformed'
					: message.type === CHAT_MESSAGE_TYPE.ERROR_MSG
					? 'chat-box-message error'
					: message.type === CHAT_MESSAGE_TYPE.BOT
					? 'chat-box-message bot'
					: 'chat-box-message bot blocked'
			}
			lang="en"
		>
			{message.type === CHAT_MESSAGE_TYPE.LEVEL_INFO && (
				<p className="header">Information</p>
			)}
			{message.transformedMessage ? (
				<span>
					{message.transformedMessage.preMessage}
					<b>{message.transformedMessage.message}</b>
					{message.transformedMessage.postMessage}
				</span>
			) : (
				message.message
			)}
		</section>
	);
}

export default ChatBoxMessage;
