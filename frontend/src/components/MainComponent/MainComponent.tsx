import { useEffect, useRef, useState, JSX } from 'react';

import { DEFAULT_DEFENCES } from '@src/Defences';
import HandbookOverlay from '@src/components/HandbookOverlay/HandbookOverlay';
import LevelMissionInfoBanner from '@src/components/LevelMissionInfoBanner/LevelMissionInfoBanner';
import ResetLevelOverlay from '@src/components/Overlay/ResetLevel';
import { ChatMessage, ChatModel } from '@src/models/chat';
import { DEFENCE_ID, DefenceConfigItem, Defence } from '@src/models/defence';
import { EmailInfo } from '@src/models/email';
import { LEVEL_NAMES, LevelSystemRole } from '@src/models/level';
import {
	chatService,
	defenceService,
	emailService,
	levelService,
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
	openInformationOverlay,
	openLevelsCompleteOverlay,
	openOverlay,
	openResetProgressOverlay,
	openWelcomeOverlay,
	setCurrentLevel,
}: {
	currentLevel: LEVEL_NAMES;
	numCompletedLevels: number;
	closeOverlay: () => void;
	updateNumCompletedLevels: (level: LEVEL_NAMES) => void;
	openDocumentViewer: () => void;
	openInformationOverlay: () => void;
	openLevelsCompleteOverlay: () => void;
	openOverlay: (overlayComponent: JSX.Element) => void;
	openResetProgressOverlay: () => void;
	openWelcomeOverlay: () => void;
	setCurrentLevel: (newLevel: LEVEL_NAMES) => void;
}) {
	const [MainBodyKey, setMainBodyKey] = useState<number>(0);
	const [defences, setDefences] = useState<Defence[]>(DEFAULT_DEFENCES);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [emails, setEmails] = useState<EmailInfo[]>([]);
	const [chatModels, setChatModels] = useState<string[]>([]);
	const [systemRoles, setSystemRoles] = useState<LevelSystemRole[]>([]);
	const [chatModel, setChatModel] = useState<ChatModel | undefined>(undefined);

	const isFirstRender = useRef(true);

	// facilitate refresh / first render
	useEffect(() => {
		console.log(
			'Loading initial backend data plus data for level',
			currentLevel
		);
		void loadBackendData();
	}, []);

	// facilitate level change
	useEffect(() => {
		if (!isFirstRender.current) {
			console.log('Loading backend data for level', currentLevel);
			void setNewLevel(currentLevel);
		}
		isFirstRender.current = false;
	}, [currentLevel]);

	async function loadBackendData() {
		try {
			const {
				availableModels,
				defences,
				emails,
				chatHistory,
				systemRoles,
				chatModel,
			} = await startService.start(currentLevel);
			setChatModels(availableModels);
			setSystemRoles(systemRoles);
			processBackendLevelData(
				currentLevel,
				emails,
				chatHistory,
				defences,
				chatModel
			);
		} catch (err) {
			console.warn(err);
			setMessages([
				{
					message: 'Failed to reach the server. Please try again later.',
					type: 'ERROR_MSG',
				},
			]);
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

	function openHandbook() {
		openOverlay(
			<HandbookOverlay
				currentLevel={currentLevel}
				numCompletedLevels={numCompletedLevels}
				systemRoles={systemRoles}
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
		const { emails, chatHistory, defences, chatModel } =
			await levelService.loadLevel(newLevel);
		processBackendLevelData(newLevel, emails, chatHistory, defences, chatModel);
	}

	function processBackendLevelData(
		level: LEVEL_NAMES,
		emails: EmailInfo[],
		chatHistory: ChatMessage[],
		defences: Defence[],
		chatModel?: ChatModel
	) {
		setEmails(emails);

		// add welcome message for levels only
		level !== LEVEL_NAMES.SANDBOX
			? setMessagesWithWelcome(chatHistory)
			: setMessages(chatHistory);

		setDefences(defences);

		// we will only update the chatModel if it is defined in the backend response. It will only defined for the sandbox level.
		setChatModel(chatModel);
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
		const newDefences = defences.map((defence) => {
			if (defence.id === defenceId) {
				defence.config.forEach((config) => {
					if (config.id === configId) {
						config.value = resetDefence.value.trim();
					}
				});
			}
			return defence;
		});
		setDefences(newDefences);
	}

	async function setDefenceToggle(defence: Defence) {
		await defenceService.toggleDefence(
			defence.id,
			defence.isActive,
			currentLevel
		);

		const newDefenceDetails = defences.map((defenceDetail) => {
			if (defenceDetail.id === defence.id) {
				defenceDetail.isActive = !defence.isActive;
				const action = defenceDetail.isActive ? 'activated' : 'deactivated';
				const infoMessage = `${defence.name} defence ${action}`;
				addInfoMessage(infoMessage.toLowerCase());
			}
			return defenceDetail;
		});

		setDefences(newDefenceDetails);
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
			const newDefences = defences.map((defence) => {
				if (defence.id === defenceId) {
					defence.config = config;
				}
				return defence;
			});
			setDefences(newDefences);
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

	function setChatModelId(modelId: string) {
		if (!chatModel) {
			console.error(
				'You are trying to change the id of the chatModel but it has not been loaded yet'
			);
			return;
		}
		setChatModel({ ...chatModel, id: modelId });
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
				defences={defences}
				chatModel={chatModel}
				setChatModelId={setChatModelId}
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
