import { useState } from 'react';

import { DEFENCES_HIDDEN_LEVEL3_IDS, MODEL_DEFENCES } from '@src/Defences';
import DefenceBox from '@src/components/DefenceBox/DefenceBox';
import DocumentViewButton from '@src/components/DocumentViewer/DocumentViewButton';
import ModelBox from '@src/components/ModelBox/ModelBox';
import { ChatModel } from '@src/models/chat';
import {
	DEFENCE_ID,
	DefenceConfigItem,
	Defence,
	DEFENCE_CONFIG_ITEM_ID,
} from '@src/models/defence';
import { LEVEL_NAMES } from '@src/models/level';

import './ControlPanel.css';

function ControlPanel({
	currentLevel,
	defences,
	chatModel,
	setChatModelId,
	chatModelOptions,
	toggleDefence,
	resetDefenceConfiguration,
	setDefenceConfiguration,
	openDocumentViewer,
	addInfoMessage,
}: {
	currentLevel: LEVEL_NAMES;
	defences: Defence[];
	chatModel?: ChatModel;
	setChatModelId: (modelId: string) => void;
	chatModelOptions: string[];
	toggleDefence: (defence: Defence) => void;
	resetDefenceConfiguration: (
		defenceId: DEFENCE_ID,
		configItemId: DEFENCE_CONFIG_ITEM_ID
	) => void;
	setDefenceConfiguration: (
		defenceId: DEFENCE_ID,
		config: DefenceConfigItem[]
	) => Promise<boolean>;
	openDocumentViewer: () => void;
	addInfoMessage: (message: string) => void;
}) {
	const configurableDefences =
		currentLevel === LEVEL_NAMES.SANDBOX
			? defences
			: currentLevel === LEVEL_NAMES.LEVEL_3
			? defences.filter(
					(defence) => !DEFENCES_HIDDEN_LEVEL3_IDS.includes(defence.id)
			  )
			: [];

	const nonModelDefences = configurableDefences.filter(
		(defence) => !MODEL_DEFENCES.includes(defence.id)
	);

	const modelDefences = configurableDefences.filter((defence) =>
		MODEL_DEFENCES.includes(defence.id)
	);

	// only allow configuration in sandbox
	const showConfigurations = currentLevel === LEVEL_NAMES.SANDBOX;

	const [showDetailsInfo, setshowDetailsInfo] = useState<
		Record<string, boolean>
	>({});

	function toggleButtonState(buttonId: string) {
		setshowDetailsInfo((prevState: Record<string, boolean>) => ({
			...prevState,
			[buttonId]: !prevState[buttonId],
		}));
	}

	return (
		<div className="control-panel">
			{/* only show control panel on level 3 and sandbox */}
			{(currentLevel === LEVEL_NAMES.LEVEL_3 ||
				currentLevel === LEVEL_NAMES.SANDBOX) && (
				<>
					{/* <h2 className="visually-hidden">ScottBrew System Access</h2> */}
					<h2>ScottBrew System Access</h2>
					{/* <button>expand all</button> */}
					<button
						type="button"
						aria-expanded={
							showDetailsInfo['details-for-defence-config'] || false
						}
						className="details-button-defence-config control-collapsible-section-header"
						onClick={toggleButtonState.bind(null, 'details-for-defence-config')}
					>
						<span className="button-arrow-icon" aria-hidden>
							{showDetailsInfo['details-for-defence-config']
								? '\u2B9F'
								: '\u2B9E'}
							&nbsp;
						</span>
						Defence Configuration
					</button>
					<div className="details-panel-for-defence-config">
						<DefenceBox
							currentLevel={currentLevel}
							defences={nonModelDefences}
							showConfigurations={showConfigurations}
							resetDefenceConfiguration={resetDefenceConfiguration}
							toggleDefence={toggleDefence}
							setDefenceConfiguration={setDefenceConfiguration}
						/>
					</div>
					<button
						type="button"
						aria-expanded={showDetailsInfo['details-for-model-config'] || false}
						className="details-button-model-config control-collapsible-section-header"
						onClick={toggleButtonState.bind(null, 'details-for-model-config')}
					>
						<span className="button-arrow-icon" aria-hidden>
							{showDetailsInfo['details-for-model-config']
								? '\u2B9F'
								: '\u2B9E'}
							&nbsp;
						</span>
						Model Configuration
					</button>
					<div className="details-panel-for-model-config">
						<DefenceBox
							currentLevel={currentLevel}
							defences={modelDefences}
							showConfigurations={showConfigurations}
							toggleDefence={toggleDefence}
							resetDefenceConfiguration={resetDefenceConfiguration}
							setDefenceConfiguration={setDefenceConfiguration}
						/>
						{showConfigurations && (
							<ModelBox
								chatModel={chatModel}
								setChatModelId={setChatModelId}
								chatModelOptions={chatModelOptions}
								addInfoMessage={addInfoMessage}
							/>
						)}
					</div>
				</>
			)}

			{/* only show document viewer button in sandbox mode */}
			{currentLevel === LEVEL_NAMES.SANDBOX && (
				<DocumentViewButton openDocumentViewer={openDocumentViewer} />
			)}
		</div>
	);
}

export default ControlPanel;
