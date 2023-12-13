import { CHAT_MESSAGE_TYPE, ChatMessage } from '@src/models/chat';

import Avatar from './Avatar';
import MessageBubble from './MessageBubble';

import './ChatBoxMessage.css';

function ChatBoxMessage({ message }: { message: ChatMessage }) {
	const direction =
		message.type === CHAT_MESSAGE_TYPE.USER
			? 'right'
			: message.type === CHAT_MESSAGE_TYPE.BOT
			? 'left'
			: 'none';

	const owner =
		message.type === CHAT_MESSAGE_TYPE.USER
			? 'user'
			: message.type === CHAT_MESSAGE_TYPE.BOT
			? 'bot'
			: 'none';

	const className = `chat-box-message chat-box-message-${direction}`;
	return (
		<div className={className}>
			{owner !== 'none' && <Avatar owner={owner} />}
			<MessageBubble message={message} direction={direction} />
		</div>
	);
}

export default ChatBoxMessage;
