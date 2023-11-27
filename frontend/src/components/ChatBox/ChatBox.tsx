import { useEffect, useState } from 'react';

import { DEFENCE_DETAILS_ALL } from '@src/Defences';
import ExportPDFLink from '@src/components/ExportChat/ExportPDFLink';
import LoadingButton from '@src/components/ThemedButtons/LoadingButton';
import ThemedButton from '@src/components/ThemedButtons/ThemedButton';
import useUnitStepper from '@src/hooks/useUnitStepper';
import { CHAT_MESSAGE_TYPE, ChatMessage, ChatResponse } from '@src/models/chat';
import { EmailInfo } from '@src/models/email';
import { LEVEL_NAMES } from '@src/models/level';
import { addMessageToChatHistory, sendMessage } from '@src/service/chatService';
import { getSentEmails } from '@src/service/emailService';

import ChatBoxFeed from './ChatBoxFeed';
import ChatBoxInput from './ChatBoxInput';

import './ChatBox.css';

function ChatBox({
	completedLevels,
	currentLevel,
	emails,
	messages,
	addChatMessage,
	addCompletedLevel,
	resetLevel,
	setEmails,
	openLevelsCompleteOverlay,
	incrementNumCompletedLevels,
}: {
	completedLevels: Set<LEVEL_NAMES>;
	currentLevel: LEVEL_NAMES;
	emails: EmailInfo[];
	messages: ChatMessage[];
	addChatMessage: (message: ChatMessage) => void;
	addCompletedLevel: (level: LEVEL_NAMES) => void;
	resetLevel: () => void;
	setEmails: (emails: EmailInfo[]) => void;
	openLevelsCompleteOverlay: () => void;
	incrementNumCompletedLevels: (level: LEVEL_NAMES) => void;
}) {
	const [chatInput, setChatInput] = useState<string>('');
	const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);
	const {
		value: recalledMessageReverseIndex,
		increment: recallLaterMessage,
		decrement: recallEarlierMessage,
		reset: resetRecallToLatest,
	} = useUnitStepper();

	// called on mount
	useEffect(() => {
		// get sent emails
		getSentEmails(currentLevel)
			.then((sentEmails) => {
				setEmails(sentEmails);
			})
			.catch((err) => {
				console.log(err);
			});
	}, [setEmails]);

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

	async function sendChatMessage() {
		if (chatInput && !isSendingMessage) {
			setIsSendingMessage(true);
			// clear the input box
			setChatInput('');
			// if input has been edited, add both messages to the list of messages. otherwise add original message only
			addChatMessage({
				message: chatInput,
				type: CHAT_MESSAGE_TYPE.USER,
			});

			const response: ChatResponse = await sendMessage(chatInput, currentLevel);
			if (response.wonLevel) incrementNumCompletedLevels(currentLevel);
			const transformedMessage = response.transformedMessage;
			const isTransformed = transformedMessage !== chatInput;
			// add the transformed message to the chat box if it is different from the original message
			if (isTransformed) {
				addChatMessage({
					message: transformedMessage,
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
			else if (response.defenceInfo.isBlocked) {
				addChatMessage({
					type: CHAT_MESSAGE_TYPE.BOT_BLOCKED,
					message: response.defenceInfo.blockedReason,
				});
			} else {
				addChatMessage({
					type: CHAT_MESSAGE_TYPE.BOT,
					message: response.reply,
				});
			}
			// add altered defences to the chat
			response.defenceInfo.alertedDefences.forEach((triggeredDefence) => {
				// get user-friendly defence name
				const defenceName = DEFENCE_DETAILS_ALL.find((defence) => {
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
			response.defenceInfo.triggeredDefences.forEach((triggeredDefence) => {
				// get user-friendly defence name
				const defenceName = DEFENCE_DETAILS_ALL.find((defence) => {
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

			// we have the message reply
			setIsSendingMessage(false);

			// get sent emails
			const sentEmails: EmailInfo[] = await getSentEmails(currentLevel);
			// update emails
			setEmails(sentEmails);

			if (response.wonLevel && !completedLevels.has(currentLevel)) {
				addCompletedLevel(currentLevel);
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
						>
							Send
						</LoadingButton>
					</span>
				</div>

				<div className="control-buttons">
					<ExportPDFLink
						messages={messages}
						emails={emails}
						currentLevel={currentLevel}
					/>
					<ThemedButton onClick={resetLevel}>Reset</ThemedButton>
				</div>
			</div>
		</div>
	);
}

export default ChatBox;
