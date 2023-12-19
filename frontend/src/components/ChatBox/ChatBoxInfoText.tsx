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
					? 'chat-box-info-defence-triggered-text'
					: type === CHAT_MESSAGE_TYPE.DEFENCE_ALERTED
					? 'chat-box-info-defence-alerted-text'
					: 'chat-box-info-text'
			)}
		>
			<span className="visually-hidden">{messageType}</span>
			{text}
		</section>
	);
}

export default ChatBoxInfoText;
