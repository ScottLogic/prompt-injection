import { useEffect, useRef } from 'react';

import { CHAT_MESSAGE_TYPE, ChatMessage } from '@src/models/chat';

import ChatBoxInfoText from './ChatBoxInfoText';
import ChatBoxMessage from './ChatBoxMessage/ChatBoxMessage';

import './ChatBoxFeed.css';

function ChatBoxFeed({ messages }: { messages: ChatMessage[] }) {
	const chatboxFeedContainer = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (chatboxFeedContainer.current) {
			chatboxFeedContainer.current.scrollTop =
				chatboxFeedContainer.current.scrollHeight;
		}
	}, [messages]);

	return (
		<section
			className="chat-box-feed"
			ref={chatboxFeedContainer}
			aria-live="polite"
		>
			{[...messages].map((message, index) => {
				if (
					message.type === CHAT_MESSAGE_TYPE.INFO ||
					message.type === CHAT_MESSAGE_TYPE.DEFENCE_ALERTED ||
					message.type === CHAT_MESSAGE_TYPE.DEFENCE_TRIGGERED ||
					message.type === CHAT_MESSAGE_TYPE.RESET_LEVEL
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
		</section>
	);
}

export default ChatBoxFeed;
