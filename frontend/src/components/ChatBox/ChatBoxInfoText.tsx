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

		const supportText = 
		type === CHAT_MESSAGE_TYPE.INFO
		? `Info message: `
		: type === CHAT_MESSAGE_TYPE.DEFENCE_ALERTED
		? `Info message: `
		: type === CHAT_MESSAGE_TYPE.DEFENCE_TRIGGERED 
		? `Info message: `
		: 'unknown message type: '
	return (
		// eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
		<div tabIndex={0}>
		<p aria-label={supportText+text} className="visually-hidden"></p>
		<div
			aria-hidden
			className={clsx(
				'chat-box-info',
				type === CHAT_MESSAGE_TYPE.DEFENCE_TRIGGERED
					? 'chat-box-info-defence-triggered-text'
					: type === CHAT_MESSAGE_TYPE.DEFENCE_ALERTED
					? 'chat-box-info-defence-alerted-text'
					: 'chat-box-info-text'
			)}
		>
			{text}
		</div>
		</div>
	);
}

export default ChatBoxInfoText;
