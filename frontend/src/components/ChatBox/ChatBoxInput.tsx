import { KeyboardEvent } from 'react';

import ThemedTextArea from '@src/components/ThemedInput/ThemedTextArea';

import './ChatBoxInput.css';

function ChatBoxInput({
	content,
	onContentChanged,
	recallSentMessageFromHistory,
	sendChatMessage,
}: {
	content: string;
	onContentChanged: (newContent: string) => void;
	recallSentMessageFromHistory: (direction: 'backward' | 'forward') => void;
	sendChatMessage: () => void;
}) {
	function isCtrlUp(event: KeyboardEvent<HTMLTextAreaElement>) {
		return event.ctrlKey && event.key === 'ArrowUp';
	}

	function isCtrlDown(event: KeyboardEvent<HTMLTextAreaElement>) {
		return event.ctrlKey && event.key === 'ArrowDown';
	}

	function isEnterNotShift(event: KeyboardEvent<HTMLTextAreaElement>) {
		return event.key === 'Enter' && !event.shiftKey;
	}

	function inputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
		if (isCtrlUp(event) || isCtrlDown(event) || isEnterNotShift(event)) {
			event.preventDefault();
		}
	}

	function inputKeyUp(event: KeyboardEvent<HTMLTextAreaElement>) {
		// shift+enter shouldn't send message
		if (isEnterNotShift(event)) {
			sendChatMessage();
		} else if (isCtrlDown(event)) {
			recallSentMessageFromHistory('backward');
		} else if (isCtrlUp(event)) {
			recallSentMessageFromHistory('forward');
		}
	}

	const CHARACTER_LIMIT = 16384; // 2^14, just over twice the length of a DAN attack

	return (
		<label>
			<h2 className="visually-hidden">Chat with the chatbot</h2>
			<ThemedTextArea
				content={content}
				onContentChanged={onContentChanged}
				placeHolderText="Type your prompt here. Press return to send."
				spacing="loose"
				maxLines={10}
				onKeyDown={inputKeyDown}
				onKeyUp={inputKeyUp}
				characterLimit={CHARACTER_LIMIT}
				// eslint-disable-next-line jsx-a11y/no-autofocus
				autoFocus={true}
				id="chat-box-input"
			/>
		</label>
	);
}

export default ChatBoxInput;
