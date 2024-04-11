/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { clsx } from 'clsx';

import { CHAT_MESSAGE_TYPE } from '@src/models/chat';

import './ChatBoxInfoText.css';

function ChatBoxInfoText({
	text,
	type,
}: {
	text: string;
	type: CHAT_MESSAGE_TYPE;
}) {
	const messageType =
		type === 'GENERIC_INFO' ||
		type === 'RESET_LEVEL' ||
		type === 'DEFENCE_ALERTED' ||
		type === 'DEFENCE_TRIGGERED'
			? 'Information message '
			: 'unknown message type';
	return (
		<section
			tabIndex={0}
			className={clsx(
				'chat-box-info',
				type === 'DEFENCE_TRIGGERED'
					? 'defence-triggered-text'
					: type === 'DEFENCE_ALERTED'
						? 'defence-alerted-text'
						: type === 'RESET_LEVEL'
							? 'reset-level-text'
							: 'info-text'
			)}
		>
			<span className="visually-hidden">{messageType}</span>
			{type === 'RESET_LEVEL' ? <span>{text}</span> : text}
		</section>
	);
}

export default ChatBoxInfoText;
