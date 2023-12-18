import { CHAT_MESSAGE_TYPE, ChatMessage } from '@src/models/chat';

import Avatar from './Avatar';
import MessageBubble from './MessageBubble';

import './ChatBoxMessage.css';

function ChatBoxMessage({ message }: { message: ChatMessage }) {
	const avatar =
		message.type === CHAT_MESSAGE_TYPE.USER ||
		message.type === CHAT_MESSAGE_TYPE.USER_TRANSFORMED
			? 'user'
			: message.type === CHAT_MESSAGE_TYPE.BOT
			? 'bot'
			: message.type === CHAT_MESSAGE_TYPE.BOT_BLOCKED ||
			  message.type === CHAT_MESSAGE_TYPE.ERROR_MSG
			? 'botError'
			: 'none';

	const position =
		avatar === 'botError' || avatar === 'bot'
			? 'left'
			: avatar === 'user'
			? 'right'
			: 'centre';

	const className = `chat-box-message chat-box-message-${position}`;
	
	return (
		<div className={className}>
			{avatar !== 'none' && <Avatar avatar={avatar} />}
			<MessageBubble message={message} position={position} />
		</div>
	);
}

export default ChatBoxMessage;
