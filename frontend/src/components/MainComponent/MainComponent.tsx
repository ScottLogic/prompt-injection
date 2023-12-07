import { useEffect, useState } from 'react';

import { ALL_DEFENCES, DEFENCES_SHOWN_LEVEL3 } from '@src/Defences';
import { CHAT_MESSAGE_TYPE, ChatMessage } from '@src/models/chat';
import { DEFENCE_ID, DefenceConfigItem, Defence } from '@src/models/defence';
import { EmailInfo } from '@src/models/email';
import { LEVEL_NAMES } from '@src/models/level';
import {
	addMessageToChatHistory,
	clearChat,
	getChatHistory,
} from '@src/service/chatService';
import {
	activateDefence,
	configureDefence,
	deactivateDefence,
	getDefences,
	resetActiveDefences,
	resetDefenceConfig,
} from '@src/service/defenceService';
import { clearEmails, getSentEmails } from '@src/service/emailService';

import MainBody from './MainBody';
import MainFooter from './MainFooter';
import MainHeader from './MainHeader';

import './MainComponent.css';

function MainComponent({
	currentLevel,
	numCompletedLevels,
	hasReset,
	incrementNumCompletedLevels,
	openHandbook,
	openInformationOverlay,
	openLevelsCompleteOverlay,
	openWelcomeOverlay,
	openResetProgressOverlay,
	openDocumentViewer,
	setCurrentLevel,
}: {
	currentLevel: LEVEL_NAMES;
	numCompletedLevels: number;
	hasReset: boolean;
	incrementNumCompletedLevels: (level: number) => void;
	openHandbook: () => void;
	openInformationOverlay: () => void;
	openLevelsCompleteOverlay: () => void;
	openWelcomeOverlay: () => void;
	openResetProgressOverlay: () => void;
	openDocumentViewer: () => void;
	setCurrentLevel: (newLevel: LEVEL_NAMES) => void;
}) {
	const [MainBodyKey, setMainBodyKey] = useState<number>(0);
	const [defencesToShow, setDefencesToShow] = useState<Defence[]>(ALL_DEFENCES);
	const [emails, setEmails] = useState<EmailInfo[]>([]);
	const [messages, setMessages] = useState<ChatMessage[]>([]);

	useEffect(() => {
		void setNewLevel(currentLevel);
	}, [currentLevel]);

	// when hasReset is true, reset the frontend state
	useEffect(() => {
		if (hasReset) {
			resetFrontendState();
		}
	}, [hasReset]);

	// methods to modify messages
	function addChatMessage(message: ChatMessage) {
		setMessages((messages: ChatMessage[]) => [...messages, message]);
	}

	function getResetDefences(currentLevel: LEVEL_NAMES): Defence[] {
		// choose appropriate defences to display
		let defences: Defence[] =
			currentLevel === LEVEL_NAMES.LEVEL_3
				? DEFENCES_SHOWN_LEVEL3
				: ALL_DEFENCES;
		defences = defences.map((defence) => {
			defence.isActive = false;
			return defence;
		});
		return defences;
	}

	function resetFrontendState() {
		setMessages([]);
		setEmails([]);
		setDefencesToShow(getResetDefences(currentLevel));
		currentLevel !== LEVEL_NAMES.SANDBOX && addWelcomeMessage();
	}

	// for clearing single level progress
	async function resetLevel() {
		// reset on the backend
		await Promise.all([
			clearChat(currentLevel),
			clearEmails(currentLevel),
			resetActiveDefences(currentLevel),
		]);

		// reset on state
		resetFrontendState();
	}

	// for going switching level without clearing progress
	async function setNewLevel(newLevel: LEVEL_NAMES) {
		// get emails for new level from the backend
		const levelEmails = await getSentEmails(newLevel);
		setEmails(levelEmails);

		// get chat history for new level from the backend
		const levelChatHistory = await getChatHistory(newLevel);

		setMessages(levelChatHistory);
		// add welcome message for levels only
		newLevel !== LEVEL_NAMES.SANDBOX && addWelcomeMessage();

		const defences =
			newLevel === LEVEL_NAMES.LEVEL_3 ? DEFENCES_SHOWN_LEVEL3 : ALL_DEFENCES;
		// fetch defences from backend
		const remoteDefences = await getDefences(newLevel);
		defences.map((localDefence) => {
			const matchingRemoteDefence = remoteDefences.find((remoteDefence) => {
				return localDefence.id === remoteDefence.id;
			});
			if (matchingRemoteDefence) {
				localDefence.isActive = matchingRemoteDefence.isActive;
				// set each config value
				matchingRemoteDefence.config.forEach((configEntry) => {
					// get the matching config in the local defence
					const matchingConfig = localDefence.config.find((config) => {
						return config.id === configEntry.id;
					});
					if (matchingConfig) {
						matchingConfig.value = configEntry.value;
					}
				});
			}
			return localDefence;
		});
		setDefencesToShow(defences);
		setMainBodyKey(MainBodyKey + 1);
	}

	function addInfoMessage(message: string) {
		addChatMessage({
			message,
			type: CHAT_MESSAGE_TYPE.INFO,
		});
		// asynchronously add message to chat history
		void addMessageToChatHistory(message, CHAT_MESSAGE_TYPE.INFO, currentLevel);
	}

	async function resetDefenceConfiguration(
		defenceId: DEFENCE_ID,
		configId: string
	) {
		const resetDefence = await resetDefenceConfig(defenceId, configId);
		// update state
		const newDefences = defencesToShow.map((defence) => {
			if (defence.id === defenceId) {
				defence.config.forEach((config) => {
					if (config.id === configId) {
						config.value = resetDefence.value.trim();
					}
				});
			}
			return defence;
		});
		setDefencesToShow(newDefences);
	}

	async function setDefenceActive(defence: Defence) {
		await activateDefence(defence.id, currentLevel);
		// update state
		const newDefenceDetails = defencesToShow.map((defenceDetail) => {
			if (defenceDetail.id === defence.id) {
				defenceDetail.isActive = true;
				defenceDetail.isTriggered = false;
				const infoMessage = `${defence.name} defence activated`;
				addInfoMessage(infoMessage.toLowerCase());
			}
			return defenceDetail;
		});
		setDefencesToShow(newDefenceDetails);
	}

	async function setDefenceInactive(defence: Defence) {
		await deactivateDefence(defence.id, currentLevel);
		// update state
		const newDefenceDetails = defencesToShow.map((defenceDetail) => {
			if (defenceDetail.id === defence.id) {
				defenceDetail.isActive = false;
				defenceDetail.isTriggered = false;
				const infoMessage = `${defence.name} defence deactivated`;
				addInfoMessage(infoMessage.toLowerCase());
			}
			return defenceDetail;
		});
		setDefencesToShow(newDefenceDetails);
	}

	async function setDefenceConfiguration(
		defenceId: DEFENCE_ID,
		config: DefenceConfigItem[]
	) {
		const success = await configureDefence(defenceId, config, currentLevel);
		if (success) {
			// update state
			const newDefences = defencesToShow.map((defence) => {
				if (defence.id === defenceId) {
					defence.config = config;
				}
				return defence;
			});
			setDefencesToShow(newDefences);
		}
		return success;
	}

	function addWelcomeMessage() {
		const welcomeMessage: ChatMessage = {
			message: `Hello! I'm ScottBrewBot, your personal AI work assistant. You can ask me for information or to help you send emails. What can I do for you?`,
			type: CHAT_MESSAGE_TYPE.BOT,
		};
		setMessages((messages: ChatMessage[]) => [welcomeMessage, ...messages]);
	}

	return (
		<div className="main-component">
			<MainHeader
				currentLevel={currentLevel}
				numCompletedLevels={numCompletedLevels}
				openHandbook={openHandbook}
				openResetProgress={openResetProgressOverlay}
				setCurrentLevel={setCurrentLevel}
			/>
			<MainBody
				key={MainBodyKey}
				currentLevel={currentLevel}
				defences={defencesToShow}
				emails={emails}
				messages={messages}
				addChatMessage={addChatMessage}
				resetDefenceConfiguration={(defenceId: DEFENCE_ID, configId: string) =>
					void resetDefenceConfiguration(defenceId, configId)
				}
				resetLevel={() => void resetLevel()}
				setDefenceActive={(defence: Defence) => void setDefenceActive(defence)}
				setDefenceInactive={(defence: Defence) =>
					void setDefenceInactive(defence)
				}
				setDefenceConfiguration={setDefenceConfiguration}
				setEmails={setEmails}
				incrementNumCompletedLevels={incrementNumCompletedLevels}
				openInfoOverlay={openInformationOverlay}
				openLevelsCompleteOverlay={openLevelsCompleteOverlay}
				openWelcomeOverlay={openWelcomeOverlay}
				openDocumentViewer={openDocumentViewer}
			/>
			<MainFooter />
		</div>
	);
}

export default MainComponent;
