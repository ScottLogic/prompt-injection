import ChatBox from '@src/components/ChatBox/ChatBox';
import ControlPanel from '@src/components/ControlPanel/ControlPanel';
import EmailBox from '@src/components/EmailBox/EmailBox';
import { ChatMessage, ChatModel } from '@src/models/chat';
import {
	DEFENCE_ID,
	DefenceConfigItem,
	Defence,
	DEFENCE_CONFIG_ITEM_ID,
} from '@src/models/defence';
import { EmailInfo } from '@src/models/email';
import { LEVEL_NAMES } from '@src/models/level';

import './MainBody.css';

function MainBody({
	currentLevel,
	defences,
	emails,
	messages,
	chatModel,
	chatModels,
	setChatModelId,
	addChatMessage,
	addInfoMessage,
	addSentEmails,
	resetDefenceConfiguration,
	toggleDefence,
	setDefenceConfiguration,
	updateNumCompletedLevels,
	openDocumentViewer,
	openLevelsCompleteOverlay,
	openResetLevelOverlay,
}: {
	currentLevel: LEVEL_NAMES;
	defences: Defence[];
	emails: EmailInfo[];
	messages: ChatMessage[];
	chatModel?: ChatModel;
	setChatModelId: (modelId: string) => void;
	chatModels: string[];
	addChatMessage: (message: ChatMessage) => void;
	addInfoMessage: (message: string) => void;
	addSentEmails: (emails: EmailInfo[]) => void;
	resetDefenceConfiguration: (
		defenceId: DEFENCE_ID,
		configItemId: DEFENCE_CONFIG_ITEM_ID
	) => void;
	resetLevel: () => void;
	toggleDefence: (defence: Defence) => void;
	setDefenceConfiguration: (
		defenceId: DEFENCE_ID,
		config: DefenceConfigItem[]
	) => Promise<boolean>;
	updateNumCompletedLevels: (level: LEVEL_NAMES) => void;
	openDocumentViewer: () => void;
	openLevelsCompleteOverlay: () => void;
	openResetLevelOverlay: () => void;
}) {
	return (
		<main className="main-area">
			<div className="left-side-bar">
				<ControlPanel
					currentLevel={currentLevel}
					defences={defences}
					chatModel={chatModel}
					setChatModelId={setChatModelId}
					chatModelOptions={chatModels}
					toggleDefence={toggleDefence}
					resetDefenceConfiguration={resetDefenceConfiguration}
					setDefenceConfiguration={setDefenceConfiguration}
					openDocumentViewer={openDocumentViewer}
					addInfoMessage={addInfoMessage}
					addChatMessage={addChatMessage}
				/>
			</div>
			<div className="centre-area">
				<ChatBox
					currentLevel={currentLevel}
					emails={emails}
					messages={messages}
					addChatMessage={addChatMessage}
					addSentEmails={addSentEmails}
					updateNumCompletedLevels={updateNumCompletedLevels}
					openLevelsCompleteOverlay={openLevelsCompleteOverlay}
					openResetLevelOverlay={openResetLevelOverlay}
				/>
			</div>
			<div className="right-side-bar">
				<EmailBox emails={emails} />
			</div>
		</main>
	);
}

export default MainBody;
