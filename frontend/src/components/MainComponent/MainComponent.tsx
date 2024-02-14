import { useEffect, useState } from 'react';

import { ALL_DEFENCES, DEFENCES_SHOWN_LEVEL3 } from '@src/Defences';
import LevelMissionInfoBanner from '@src/components/LevelMissionInfoBanner/LevelMissionInfoBanner';
import ResetLevelOverlay from '@src/components/Overlay/ResetLevel';
import UseIsFirstRender from '@src/hooks/useIsFirstRender';
import { ChatMessage } from '@src/models/chat';
import { DEFENCE_ID, DefenceConfigItem, Defence } from '@src/models/defence';
import { EmailInfo } from '@src/models/email';
import { LEVEL_NAMES, LevelSystemRole } from '@src/models/level';
import {
	chatService,
	defenceService,
	emailService,
	startService,
} from '@src/service';

import MainBody from './MainBody';
import MainFooter from './MainFooter';
import MainHeader from './MainHeader';

import './MainComponent.css';

function MainComponent({
	currentLevel,
	numCompletedLevels,
	closeOverlay,
	updateNumCompletedLevels,
	openDocumentViewer,
	openHandbook,
	openInformationOverlay,
	openLevelsCompleteOverlay,
	openOverlay,
	openResetProgressOverlay,
	openWelcomeOverlay,
	setCurrentLevel,
	setMessages,
	messages,
	setSystemRoles,
}: {
	currentLevel: LEVEL_NAMES;
	numCompletedLevels: number;
	closeOverlay: () => void;
	updateNumCompletedLevels: (level: number) => void;
	openDocumentViewer: () => void;
	openHandbook: () => void;
	openInformationOverlay: () => void;
	openLevelsCompleteOverlay: () => void;
	openOverlay: (overlayComponent: JSX.Element) => void;
	openResetProgressOverlay: () => void;
	openWelcomeOverlay: () => void;
	setCurrentLevel: (newLevel: LEVEL_NAMES) => void;
	setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>; // you can move message state back into this component
	messages: ChatMessage[]; // you can move message state back into this component
	setSystemRoles: React.Dispatch<React.SetStateAction<LevelSystemRole[]>>; // you can move system role state back into this component
}) {
	const [MainBodyKey, setMainBodyKey] = useState<number>(0);
	const [defencesToShow, setDefencesToShow] = useState<Defence[]>(ALL_DEFENCES);
	const [emails, setEmails] = useState<EmailInfo[]>([]);
	const [chatModels, setChatModels] = useState<string[]>([]);
	const isFirstRender = UseIsFirstRender();

	// facilitate refresh / first render
	useEffect(() => {
		void loadBackendData();
	}, []);

	// facilitate level change
	useEffect(() => {
		if (!isFirstRender) {
			console.log('Loading backend data for level', currentLevel);
			void setNewLevel(currentLevel);
		}
	}, [currentLevel]);

	// fetch constants from the backend on app mount
	async function loadBackendData() {
		try {
			console.log(
				'Loading initial backend data plus data for level',
				currentLevel
			);
			const startResponse = await startService.start(currentLevel).catch(() => {
				setMessages([
					{
						message: 'Failed to reach the server. Please try again later.',
						type: 'ERROR_MSG',
					},
				]);
			});

			if (!startResponse) return;

			setChatModels(startResponse.availableModels);
			setSystemRoles(startResponse.systemRoles);
		} catch (err) {
			console.log(err);
		}
	}

	function openResetLevelOverlay() {
		openOverlay(
			<ResetLevelOverlay
				currentLevel={currentLevel}
				resetLevel={async () => {
					await resetLevel();
					closeOverlay();
				}}
				closeOverlay={closeOverlay}
			/>
		);
	}

	// methods to modify messages
	function addChatMessage(message: ChatMessage) {
		setMessages((messages: ChatMessage[]) => [...messages, message]);
	}

	function addSentEmails(newEmails: EmailInfo[]) {
		setEmails(emails.concat(newEmails));
	}

	function resetFrontendState() {
		setMessages([]);
		setEmails([]);
		if (currentLevel !== LEVEL_NAMES.SANDBOX) {
			setMessagesWithWelcome([]);
		}
	}

	// for clearing single level progress
	async function resetLevel() {
		// reset on the backend
		await Promise.all([
			chatService.clearChat(currentLevel),
			emailService.clearEmails(currentLevel),
		]);

		resetFrontendState();
		addResetMessage();
	}

	// for going switching level without clearing progress
	async function setNewLevel(newLevel: LEVEL_NAMES) {
		const emails = await emailService.getSentEmails(newLevel);
		const chatHistory = await chatService.getChatHistory(newLevel);
		const defences = await defenceService.getDefences(newLevel);
		processBackendLevelData(newLevel, emails, chatHistory, defences);
	}

	function processBackendLevelData(
		level: LEVEL_NAMES,
		emails: EmailInfo[],
		chatHistory: ChatMessage[],
		remoteDefences: Defence[]
	) {
		setEmails(emails);

		// add welcome message for levels only
		level !== LEVEL_NAMES.SANDBOX
			? setMessagesWithWelcome(chatHistory)
			: setMessages(chatHistory);

		const defences =
			level === LEVEL_NAMES.LEVEL_3 ? DEFENCES_SHOWN_LEVEL3 : ALL_DEFENCES;
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
			type: 'GENERIC_INFO',
		});
		// asynchronously add message to chat history
		void chatService.addInfoMessageToChatHistory(
			message,
			'GENERIC_INFO',
			currentLevel
		);
	}

	function addConfigUpdateToChat(defenceId: DEFENCE_ID, update: string) {
		const displayedDefenceId = defenceId.replace(/_/g, ' ').toLowerCase();
		addInfoMessage(`${displayedDefenceId} defence ${update}`);
	}

	async function resetDefenceConfiguration(
		defenceId: DEFENCE_ID,
		configId: string
	) {
		const resetDefence = await defenceService.resetDefenceConfig(
			defenceId,
			configId
		);
		addConfigUpdateToChat(defenceId, 'reset');
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

	async function setDefenceToggle(defence: Defence) {
		await defenceService.toggleDefence(
			defence.id,
			defence.isActive,
			currentLevel
		);

		const newDefenceDetails = defencesToShow.map((defenceDetail) => {
			if (defenceDetail.id === defence.id) {
				defenceDetail.isActive = !defence.isActive;
				const action = defenceDetail.isActive ? 'activated' : 'deactivated';
				const infoMessage = `${defence.name} defence ${action}`;
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
		const success = await defenceService.configureDefence(
			defenceId,
			config,
			currentLevel
		);
		if (success) {
			addConfigUpdateToChat(defenceId, 'updated');
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

	function setMessagesWithWelcome(retrievedMessages: ChatMessage[]) {
		const welcomeMessage: ChatMessage = {
			message: `Hello! I'm ScottBrewBot, your personal AI work assistant. You can ask me for information or to help you send emails. What can I do for you?`,
			type: 'BOT',
		};
		// if reset level add welcome into second position, otherwise add to first
		if (retrievedMessages.length === 0) {
			setMessages([welcomeMessage]);
		} else if (retrievedMessages[0].type === 'RESET_LEVEL') {
			retrievedMessages.splice(1, 0, welcomeMessage);
			setMessages(retrievedMessages);
		} else {
			setMessages([welcomeMessage, ...retrievedMessages]);
		}
	}

	function addResetMessage() {
		const resetMessage: ChatMessage = {
			message: `Level progress reset`,
			type: 'RESET_LEVEL',
		};
		void chatService.addInfoMessageToChatHistory(
			resetMessage.message,
			resetMessage.type,
			currentLevel
		);
		setMessages((messages: ChatMessage[]) => [resetMessage, ...messages]);
	}

	return (
		<div className="main-component">
			<MainHeader
				currentLevel={currentLevel}
				numCompletedLevels={numCompletedLevels}
				openHandbook={openHandbook}
				openResetProgressOverlay={openResetProgressOverlay}
				openWelcome={openWelcomeOverlay}
				setCurrentLevel={setCurrentLevel}
			/>
			{currentLevel !== LEVEL_NAMES.SANDBOX && (
				<LevelMissionInfoBanner
					currentLevel={currentLevel}
					openOverlay={openInformationOverlay}
				/>
			)}
			<MainBody
				key={MainBodyKey}
				currentLevel={currentLevel}
				defences={defencesToShow}
				chatModels={chatModels}
				emails={emails}
				messages={messages}
				addChatMessage={addChatMessage}
				addInfoMessage={addInfoMessage}
				addSentEmails={addSentEmails}
				resetDefenceConfiguration={(defenceId: DEFENCE_ID, configId: string) =>
					void resetDefenceConfiguration(defenceId, configId)
				}
				resetLevel={() => void resetLevel()}
				toggleDefence={(defence: Defence) => void setDefenceToggle(defence)}
				setDefenceConfiguration={setDefenceConfiguration}
				updateNumCompletedLevels={updateNumCompletedLevels}
				openDocumentViewer={openDocumentViewer}
				openLevelsCompleteOverlay={openLevelsCompleteOverlay}
				openResetLevelOverlay={openResetLevelOverlay}
			/>
			<MainFooter />
		</div>
	);
}

export default MainComponent;
