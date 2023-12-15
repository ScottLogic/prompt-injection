import { CHAT_MESSAGE_TYPE, ChatMessage } from '@src/models/chat';

import Avatar from './Avatar';
import MessageBubble from './MessageBubble';

import './ChatBoxMessage.css';

function ChatBoxMessage({ message }: { message: ChatMessage }) {
	const owner =
		message.type === CHAT_MESSAGE_TYPE.USER ||
		message.type === CHAT_MESSAGE_TYPE.USER_TRANSFORMED
			? 'user'
			: message.type === CHAT_MESSAGE_TYPE.BOT ||
			  message.type === CHAT_MESSAGE_TYPE.BOT_BLOCKED ||
			  message.type === CHAT_MESSAGE_TYPE.ERROR_MSG
			? 'bot'
			: 'none';

	const direction =
		owner === 'user' ? 'right' : owner === 'bot' ? 'left' : 'none';

	const className = `chat-box-message chat-box-message-${owner}`;
	return (
		<div className={className}>
			{owner !== 'none' && (
				<Avatar
					showAs={
						message.type === CHAT_MESSAGE_TYPE.BOT_BLOCKED ||
						message.type === CHAT_MESSAGE_TYPE.ERROR_MSG
							? 'botError'
							: owner
					}
				/>
			)}
			<MessageBubble message={message} direction={direction} />
		</div>
	);
}

export default ChatBoxMessage;
