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
			? 'level-info'
			: message.type === CHAT_MESSAGE_TYPE.USER
			? 'user'
			: message.type === CHAT_MESSAGE_TYPE.USER_TRANSFORMED
			? 'user transformed'
			: message.type === CHAT_MESSAGE_TYPE.ERROR_MSG
			? 'error'
			: message.type === CHAT_MESSAGE_TYPE.BOT
			? 'bot'
			: 'bot blocked';

	const positionClassName = `${position}`;

	const className = clsx(
		baseClassName,
		messageTypeClassName,
		positionClassName
	);

	const messageAuthor =
		message.type === CHAT_MESSAGE_TYPE.LEVEL_INFO
			? ''
			: message.type === CHAT_MESSAGE_TYPE.USER
			? 'You said: '
			: message.type === CHAT_MESSAGE_TYPE.USER_TRANSFORMED
			? 'Your message transformed by XML tagging: '
			: message.type === CHAT_MESSAGE_TYPE.ERROR_MSG
			? 'Error message: '
			: message.type === CHAT_MESSAGE_TYPE.BOT
			? 'ScottBrewBot said:  '
			: 'ScottBrewBot said: ';

	return (
		// eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
		<section className={className} lang="en" tabIndex={0}>
			{message.type === CHAT_MESSAGE_TYPE.LEVEL_INFO && (
				<>
					<p className="header">Information</p>
					<span className="visually-hidden"> message: </span>
				</>
			)}
			<span className="visually-hidden">{messageAuthor}</span>
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

export default MessageBubble;
