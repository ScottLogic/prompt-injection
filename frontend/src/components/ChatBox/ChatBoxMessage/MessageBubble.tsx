import { CHAT_MESSAGE_TYPE, ChatMessage } from '@src/models/chat';

import './MessageBubble.css';

function MessageBubble({ message }: { message: ChatMessage }) {
	return (
		<div
			className={
				message.type === CHAT_MESSAGE_TYPE.LEVEL_INFO
					? 'message-bubble message-bubble-level-info'
					: message.type === CHAT_MESSAGE_TYPE.USER
					? 'message-bubble message-bubble-user'
					: message.type === CHAT_MESSAGE_TYPE.USER_TRANSFORMED
					? 'message-bubble message-bubble-user message-bubble-user-transformed'
					: message.type === CHAT_MESSAGE_TYPE.ERROR_MSG
					? 'message-bubble message-bubble-error'
					: message.type === CHAT_MESSAGE_TYPE.BOT
					? 'message-bubble message-bubble-ai'
					: 'message-bubble message-bubble-ai message-bubble-ai-blocked'
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

export default MessageBubble;
