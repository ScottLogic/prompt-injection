import './ChatBoxInfoText.css';

import { CHAT_MESSAGE_TYPE } from '@src/models/chat';

function ChatBoxInfoText({
	text,
	type,
}: {
	text: string;
	type: CHAT_MESSAGE_TYPE;
}) {
	return (
		<div
			className={
				type === CHAT_MESSAGE_TYPE.DEFENCE_TRIGGERED
					? 'chat-box-info-defence-triggered-text'
					: type === CHAT_MESSAGE_TYPE.DEFENCE_ALERTED
					? 'chat-box-info-defence-alerted-text'
					: 'chat-box-info-text'
			}
		>
			{text}
		</div>
	);
}

export default ChatBoxInfoText;
