import { useRef } from 'react';

import useIsOverflow from '@src/hooks/useIsOverflow';
import { CHAT_MESSAGE_TYPE, ChatMessage } from '@src/models/chat';

import ChatBoxInfoText from './ChatBoxInfoText';
import ChatBoxMessage from './ChatBoxMessage/ChatBoxMessage';

import './ChatBoxFeed.css';

function ChatBoxFeed({ messages }: { messages: ChatMessage[] }) {
	const chatboxFeedContainer = useRef<HTMLDivElement>(null);
	const isOverflow = useIsOverflow(chatboxFeedContainer);

	return (
		<div
			className="chat-box-feed"
			ref={chatboxFeedContainer}
			// eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
			tabIndex={isOverflow ? 0 : undefined}
		>
			{[...messages].reverse().map((message, index) => {
				if (
					message.type === CHAT_MESSAGE_TYPE.INFO ||
					message.type === CHAT_MESSAGE_TYPE.DEFENCE_ALERTED ||
					message.type === CHAT_MESSAGE_TYPE.DEFENCE_TRIGGERED
				) {
					return (
						<ChatBoxInfoText
							key={index}
							text={message.message}
							type={message.type}
						/>
					);
				} else {
					return <ChatBoxMessage key={index} message={message} />;
				}
			})}
		</div>
	);
}

export default ChatBoxFeed;
