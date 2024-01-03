import { useEffect, useState } from 'react';

import { ALL_DEFENCES } from '@src/Defences';
import ExportPDFLink from '@src/components/ExportChat/ExportPDFLink';
import '@src/components/ThemedButtons/ChatButton.css';
import LoadingButton from '@src/components/ThemedButtons/LoadingButton';
import useUnitStepper from '@src/hooks/useUnitStepper';
import { CHAT_MESSAGE_TYPE, ChatMessage, ChatResponse } from '@src/models/chat';
import { EmailInfo } from '@src/models/email';
import { LEVEL_NAMES } from '@src/models/level';
import { addMessageToChatHistory, sendMessage } from '@src/service/chatService';

import ChatBoxFeed from './ChatBoxFeed';
import ChatBoxInput from './ChatBoxInput';

import './ChatBox.css';

function ChatBox({
	currentLevel,
	emails,
	messages,
	addChatMessage,
	addSentEmails,
	incrementNumCompletedLevels,
	openLevelsCompleteOverlay,
	openResetLevelOverlay,
}: {
	currentLevel: LEVEL_NAMES;
	emails: EmailInfo[];
	messages: ChatMessage[];
	addChatMessage: (message: ChatMessage) => void;
	addSentEmails: (emails: EmailInfo[]) => void;
	incrementNumCompletedLevels: (level: LEVEL_NAMES) => void;
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
		const sentMessages = messages.filter(
			(message) => message.type === CHAT_MESSAGE_TYPE.USER
		);

		if (direction === 'backward') recallEarlierMessage();
		else recallLaterMessage(sentMessages.length);
	}

	useEffect(() => {
		const sentMessages = messages.filter(
			(message) => message.type === CHAT_MESSAGE_TYPE.USER
		);

		// recall the message from the history. If at current time, clear the chatbox
		const index = sentMessages.length - recalledMessageReverseIndex;
		const recalledMessage =
			index === sentMessages.length ? '' : sentMessages[index]?.message ?? '';

		setChatInput(recalledMessage);
	}, [recalledMessageReverseIndex]);

	function getSuccessMessage() {
		return currentLevel < LEVEL_NAMES.LEVEL_3
			? `Congratulations! You have completed this level. Please click on the next level to continue.`
			: `Congratulations, you have completed the final level of your assignment!`;
	}

	function isLevelComplete() {
		// level is complete if the chat contains a LEVEL_INFO message
		return messages.some(
			(message) => message.type === CHAT_MESSAGE_TYPE.LEVEL_INFO
		);
	}

	function processChatResponse(response: ChatResponse) {
		if (response.wonLevel) incrementNumCompletedLevels(currentLevel);
		const transformedMessage = response.transformedMessage;
		// add the transformed message to the chat box if it is different from the original message
		if (transformedMessage) {
			addChatMessage({
				message: 'XML tagging enabled, your message has been transformed',
				type: CHAT_MESSAGE_TYPE.INFO,
			});
			addChatMessage({
				message:
					transformedMessage.preMessage +
					transformedMessage.message +
					transformedMessage.postMessage,
				transformedMessage,
				type: CHAT_MESSAGE_TYPE.USER_TRANSFORMED,
			});
		}
		if (response.isError) {
			addChatMessage({
				message: response.reply,
				type: CHAT_MESSAGE_TYPE.ERROR_MSG,
			});
		}
		// add it to the list of messages
		else if (response.defenceReport.isBlocked) {
			addChatMessage({
				type: CHAT_MESSAGE_TYPE.BOT_BLOCKED,
				message: response.defenceReport.blockedReason,
			});
		} else {
			addChatMessage({
				type: CHAT_MESSAGE_TYPE.BOT,
				message: response.reply,
			});
		}
		// add altered defences to the chat
		response.defenceReport.alertedDefences.forEach((triggeredDefence) => {
			// get user-friendly defence name
			const defenceName = ALL_DEFENCES.find((defence) => {
				return defence.id === triggeredDefence;
			})?.name.toLowerCase();
			if (defenceName) {
				const alertMsg = `your last message would have triggered the ${defenceName} defence`;
				addChatMessage({
					type: CHAT_MESSAGE_TYPE.DEFENCE_ALERTED,
					message: alertMsg,
				});
				// asynchronously add the message to the chat history
				void addMessageToChatHistory(
					alertMsg,
					CHAT_MESSAGE_TYPE.DEFENCE_ALERTED,
					currentLevel
				);
			}
		});
		// add triggered defences to the chat
		response.defenceReport.triggeredDefences.forEach((triggeredDefence) => {
			// get user-friendly defence name
			const defenceName = ALL_DEFENCES.find((defence) => {
				return defence.id === triggeredDefence;
			})?.name.toLowerCase();
			if (defenceName) {
				const triggerMsg = `${defenceName} defence triggered`;
				addChatMessage({
					type: CHAT_MESSAGE_TYPE.DEFENCE_TRIGGERED,
					message: triggerMsg,
				});
				// asynchronously add the message to the chat history
				void addMessageToChatHistory(
					triggerMsg,
					CHAT_MESSAGE_TYPE.DEFENCE_TRIGGERED,
					currentLevel
				);
			}
		});

		// update emails
		addSentEmails(response.sentEmails);

		if (response.wonLevel && !isLevelComplete()) {
			const successMessage = getSuccessMessage();
			addChatMessage({
				type: CHAT_MESSAGE_TYPE.LEVEL_INFO,
				message: successMessage,
			});
			// asynchronously add the message to the chat history
			void addMessageToChatHistory(
				successMessage,
				CHAT_MESSAGE_TYPE.LEVEL_INFO,
				currentLevel
			);
			// if this is the last level, show the level complete overlay
			if (currentLevel === LEVEL_NAMES.LEVEL_3) {
				openLevelsCompleteOverlay();
			}
		}
	}

	async function sendChatMessage() {
		if (chatInput && !isSendingMessage) {
			setIsSendingMessage(true);
			// clear the input box
			setChatInput('');
			// if input has been transformed, add both messages to the list of messages. otherwise add original message only
			addChatMessage({
				message: chatInput,
				type: CHAT_MESSAGE_TYPE.USER,
			});

			try {
				const response: ChatResponse = await sendMessage(
					chatInput,
					currentLevel
				);
				processChatResponse(response);
			} catch (e) {
				addChatMessage({
					type: CHAT_MESSAGE_TYPE.ERROR_MSG,
					message: 'Failed to get reply. Please try again.',
				});
			}

			setIsSendingMessage(false);
		}

		resetRecallToLatest();
	}

	return (
		<div className="chat-box">
			<ChatBoxFeed messages={messages} />
			<div className="footer">
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
					<ExportPDFLink
						messages={messages}
						emails={emails}
						currentLevel={currentLevel}
					/>
					<button className="chat-button" onClick={openResetLevelOverlay}>
						Reset Level
					</button>
				</div>
			</div>
		</div>
	);
}

export default ChatBox;
