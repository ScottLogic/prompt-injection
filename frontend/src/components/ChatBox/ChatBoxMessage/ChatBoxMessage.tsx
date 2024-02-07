import { ChatMessage } from '@src/models/chat';

import Avatar from './Avatar';
import MessageBubble from './MessageBubble';

import './ChatBoxMessage.css';

function ChatBoxMessage({ message }: { message: ChatMessage }) {
	const avatar =
		message.type === 'USER' || message.type === 'USER_TRANSFORMED'
			? 'user'
			: message.type === 'BOT'
			? 'bot'
			: message.type === 'BOT_BLOCKED' || message.type === 'ERROR_MSG'
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
