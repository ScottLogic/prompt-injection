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
		type === CHAT_MESSAGE_TYPE.INFO
			? 'Information message '
			: type === CHAT_MESSAGE_TYPE.DEFENCE_ALERTED
			? 'Information message '
			: type === CHAT_MESSAGE_TYPE.DEFENCE_TRIGGERED
			? 'Information message '
			: 'unknown message type ';
	return (
		<section
			tabIndex={0}
			className={clsx(
				'chat-box-info',
				type === CHAT_MESSAGE_TYPE.DEFENCE_TRIGGERED
					? 'defence-triggered-text'
					: type === CHAT_MESSAGE_TYPE.DEFENCE_ALERTED
					? 'defence-alerted-text'
					: type === CHAT_MESSAGE_TYPE.RESET_LEVEL
					? 'reset-level-text'
					: 'info-text'
			)}
		>
			<span className="visually-hidden">{messageType}</span>
			{type === CHAT_MESSAGE_TYPE.RESET_LEVEL ? <span>{text}</span> : text}
		</section>
	);
}

export default ChatBoxInfoText;
