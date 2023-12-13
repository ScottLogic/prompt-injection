import { ChatMessage } from '@src/models/chat';

import MessageBubble from './MessageBubble';

function ChatBoxMessage({ message }: { message: ChatMessage }) {
	return <MessageBubble message={message} />;
}

export default ChatBoxMessage;
