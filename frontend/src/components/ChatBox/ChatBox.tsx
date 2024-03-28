import { Suspense, lazy, useEffect, useState } from 'react';

import '@src/components/ThemedButtons/ChatButton.css';
import LoadingButton from '@src/components/ThemedButtons/LoadingButton';
import ThemedButton from '@src/components/ThemedButtons/ThemedButton';
import useUnitStepper from '@src/hooks/useUnitStepper';
import { ChatMessage, ChatResponse } from '@src/models/chat';
import { EmailInfo } from '@src/models/email';
import { LEVEL_NAMES } from '@src/models/level';
import { chatService } from '@src/service';
import { makeChatMessageFromDTO } from '@src/service/chatService';

import ChatBoxFeed from './ChatBoxFeed';
import ChatBoxInput from './ChatBoxInput';

import './ChatBox.css';

const ExportPDFLink = lazy(
	() => import('@src/components/ExportChat/ExportPDFLink')
);

function ChatBox({
	currentLevel,
	emails,
	messages,
	addChatMessage,
	addSentEmails,
	updateNumCompletedLevels,
	openLevelsCompleteOverlay,
	openResetLevelOverlay,
}: {
	currentLevel: LEVEL_NAMES;
	emails: EmailInfo[];
	messages: ChatMessage[];
	addChatMessage: (message: ChatMessage) => void;
	addSentEmails: (emails: EmailInfo[]) => void;
	updateNumCompletedLevels: (level: LEVEL_NAMES) => void;
	openLevelsCompleteOverlay: () => void;
	openResetLevelOverlay: () => void;
}) {
	const [chatInput, setChatInput] = useState<string>('');
	const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);
	const {
		value: recalledMessageReverseIndex,
		increment: recallLaterMessage,
		decrement: recallEarlierMessage,
		reset: resetRecallToLatest,
	} = useUnitStepper();

	function recallSentMessageFromHistory(direction: 'backward' | 'forward') {
		const sentMessages = messages.filter((message) => message.type === 'USER');

		if (direction === 'backward') recallEarlierMessage();
		else recallLaterMessage(sentMessages.length);
	}

	useEffect(() => {
		const sentMessages = messages.filter((message) => message.type === 'USER');

		// recall the message from the history. If at current time, clear the chatbox
		const index = sentMessages.length - recalledMessageReverseIndex;
		const recalledMessage =
			index === sentMessages.length ? '' : sentMessages[index]?.message ?? '';

		setChatInput(recalledMessage);
	}, [recalledMessageReverseIndex]);

	function processChatResponse(response: ChatResponse) {
		const newChatMessages = response.newChatMessages.map((chatMessageDTO) =>
			makeChatMessageFromDTO(chatMessageDTO)
		);

		newChatMessages.forEach((message) => {
			message.type !== 'USER' && addChatMessage(message);
		});

		// if (response.isError) {
		// 	addChatMessage({
		// 		message: response.reply,
		// 		type: 'ERROR_MSG',
		// 	});
		// } else if (response.defenceReport.isBlocked) {
		// 	addChatMessage({
		// 		type: 'BOT_BLOCKED',
		// 		message: response.defenceReport.blockedReason,
		// 	});
		// } else {
		// 	addChatMessage({
		// 		type: 'BOT',
		// 		message: response.reply,
		// 	});
		// }

		// update emails
		addSentEmails(response.sentEmails);

		if (response.wonLevel) {
			updateNumCompletedLevels(currentLevel);
		}

		// if this is the last level, show the level complete overlay
		if (response.wonLevel && currentLevel === LEVEL_NAMES.LEVEL_3) {
			openLevelsCompleteOverlay();
		}
	}

	async function sendChatMessage() {
		if (chatInput && !isSendingMessage) {
			setIsSendingMessage(true);
			setChatInput('');
			addChatMessage({
				message: chatInput,
				type: 'USER',
			});

			try {
				const response: ChatResponse = await chatService.sendMessage(
					chatInput,
					currentLevel
				);
				processChatResponse(response);
			} catch (e) {
				addChatMessage({
					type: 'ERROR_MSG',
					message: 'Failed to get reply. Please try again.',
				});
			}

			setIsSendingMessage(false);
		}

		resetRecallToLatest();
	}

	return (
		<div className="chat-box" id="chat-box">
			<a
				className="skip-to-bottom skip-link "
				id="skip-to-bottom"
				href="#chat-box-input"
			>
				<span aria-hidden>&#129035;&nbsp;</span>skip to chat input
			</a>
			<ChatBoxFeed messages={messages} />
			<div className="footer">
				<a className="skip-to-top skip-link " href="#skip-to-bottom">
					<span aria-hidden>&#129033;&nbsp;</span>skip to top of chat
				</a>
				<div className="messages">
					<ChatBoxInput
						content={chatInput}
						onContentChanged={setChatInput}
						recallSentMessageFromHistory={recallSentMessageFromHistory}
						sendChatMessage={() => void sendChatMessage()}
					/>
					<span className="send-button-wrapper">
						<LoadingButton
							onClick={() => void sendChatMessage()}
							isLoading={isSendingMessage}
							loadingTooltip="Sending message..."
						>
							send
						</LoadingButton>
					</span>
				</div>
				<div className="control-buttons">
					<Suspense
						fallback={
							<ThemedButton
								className={'chat-button chat-button-disabled'}
								// eslint-disable-next-line @typescript-eslint/no-empty-function
								onClick={() => {}}
								ariaDisabled={true}
								tooltip={{
									id: 'export-chat-tooltip',
									text: 'This button is still loading. Please wait...',
								}}
								tooltipPosition="top-center"
							>
								Export Chat
							</ThemedButton>
						}
					>
						<ExportPDFLink
							messages={messages}
							emails={emails}
							currentLevel={currentLevel}
						/>
					</Suspense>
					<button className="chat-button" onClick={openResetLevelOverlay}>
						Reset Level
					</button>
				</div>
			</div>
		</div>
	);
}

export default ChatBox;
