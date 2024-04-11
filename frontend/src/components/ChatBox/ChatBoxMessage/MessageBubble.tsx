import { clsx } from 'clsx';

import { ChatMessage } from '@src/models/chat';

import './MessageBubble.css';

function MessageBubble({
	message,
	position,
}: {
	message: ChatMessage;
	position: 'left' | 'right' | 'centre';
}) {
	const messageTypeClassName =
		message.type === 'LEVEL_COMPLETE'
			? 'level-info'
			: message.type === 'USER'
				? 'user'
				: message.type === 'USER_TRANSFORMED'
					? 'user transformed'
					: message.type === 'ERROR_MSG'
						? 'error'
						: message.type === 'BOT'
							? 'bot'
							: 'bot blocked';

	const className = clsx('message-bubble', messageTypeClassName, position);

	const messageAuthor =
		message.type === 'LEVEL_COMPLETE'
			? ''
			: message.type === 'USER'
				? 'You said:'
				: message.type === 'USER_TRANSFORMED'
					? 'Your message transformed by XML tagging: '
					: message.type === 'ERROR_MSG'
						? 'Error message:'
						: 'ScottBrewBot said:';

	return (
		// eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
		<section className={className} tabIndex={0}>
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
