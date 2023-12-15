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
	return (
		<div
			className={clsx(
				'chat-box-info',
				type === CHAT_MESSAGE_TYPE.DEFENCE_TRIGGERED
					? 'defence-triggered-text'
					: type === CHAT_MESSAGE_TYPE.DEFENCE_ALERTED
					? 'defence-alerted-text'
					: 'text'
			)}
		>
			{text}
		</div>
	);
}

export default ChatBoxInfoText;
