import ChatBox from '@src/components/ChatBox/ChatBox';
import ControlPanel from '@src/components/ControlPanel/ControlPanel';
import EmailBox from '@src/components/EmailBox/EmailBox';
import { ChatMessage } from '@src/models/chat';
import { DEFENCE_ID, DefenceConfigItem, Defence } from '@src/models/defence';
import { EmailInfo } from '@src/models/email';
import { LEVEL_NAMES } from '@src/models/level';

import './MainBody.css';

function MainBody({
	currentLevel,
	defences,
	emails,
	messages,
	chatModels,
	addChatMessage,
	addSentEmails,
	resetDefenceConfiguration,
	toggleDefence,
	setDefenceConfiguration,
	incrementNumCompletedLevels,
	openDocumentViewer,
	openLevelsCompleteOverlay,
	openResetLevelOverlay,
}: {
	currentLevel: LEVEL_NAMES;
	defences: Defence[];
	emails: EmailInfo[];
	messages: ChatMessage[];
	chatModels: string[];
	addChatMessage: (message: ChatMessage) => void;
	addSentEmails: (emails: EmailInfo[]) => void;
	resetDefenceConfiguration: (defenceId: DEFENCE_ID, configId: string) => void;
	resetLevel: () => void;
	toggleDefence: (defence: Defence) => void;
	setDefenceConfiguration: (
		defenceId: DEFENCE_ID,
		config: DefenceConfigItem[]
	) => Promise<boolean>;
	incrementNumCompletedLevels: (level: LEVEL_NAMES) => void;
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
					chatModelOptions={chatModels}
					toggleDefence={toggleDefence}
					resetDefenceConfiguration={resetDefenceConfiguration}
					setDefenceConfiguration={setDefenceConfiguration}
					openDocumentViewer={openDocumentViewer}
				/>
			</div>
			<div className="centre-area">
				<ChatBox
					currentLevel={currentLevel}
					emails={emails}
					messages={messages}
					addChatMessage={addChatMessage}
					addSentEmails={addSentEmails}
					incrementNumCompletedLevels={incrementNumCompletedLevels}
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
