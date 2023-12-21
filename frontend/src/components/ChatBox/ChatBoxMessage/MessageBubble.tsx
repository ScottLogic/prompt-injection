import { clsx } from 'clsx';

import { CHAT_MESSAGE_TYPE, ChatMessage } from '@src/models/chat';

import './MessageBubble.css';

function MessageBubble({
	message,
	position,
}: {
	message: ChatMessage;
	position: 'left' | 'right' | 'centre';
}) {
	const baseClassName = 'message-bubble';

	const messageTypeClassName =
		message.type === CHAT_MESSAGE_TYPE.LEVEL_INFO
			? 'message-bubble-level-info'
			: message.type === CHAT_MESSAGE_TYPE.USER
			? 'message-bubble-user'
			: message.type === CHAT_MESSAGE_TYPE.USER_TRANSFORMED
			? 'message-bubble-user-transformed'
			: message.type === CHAT_MESSAGE_TYPE.ERROR_MSG
			? 'message-bubble-error'
			: message.type === CHAT_MESSAGE_TYPE.BOT
			? 'message-bubble-ai'
			: 'message-bubble-ai-blocked';

	const positionClassName = `message-bubble-${position}`;

	const className = clsx(
		baseClassName,
		messageTypeClassName,
		positionClassName
	);

	return (
		<div className={className} lang="en">
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
