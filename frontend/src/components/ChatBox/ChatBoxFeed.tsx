import { useEffect, useRef } from 'react';

import { ChatMessage } from '@src/models/chat';

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
					message.type === 'INFO' ||
					message.type === 'DEFENCE_ALERTED' ||
					message.type === 'DEFENCE_TRIGGERED' ||
					message.type === 'RESET_LEVEL'
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
