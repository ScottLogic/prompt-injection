import { DEFENCES_HIDDEN_LEVEL3_IDS, MODEL_DEFENCES } from '@src/Defences';
import DefenceBox from '@src/components/DefenceBox/DefenceBox';
import DocumentViewButton from '@src/components/DocumentViewer/DocumentViewButton';
import ModelBox from '@src/components/ModelBox/ModelBox';
import DetailElement from '@src/components/ThemedButtons/DetailElement';
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

	// only allow configuration in sandbox and level 3
	const showConfigurations =
		currentLevel === LEVEL_NAMES.SANDBOX ||
		currentLevel === LEVEL_NAMES.LEVEL_3;

	return (
		<div className="control-panel">
			{/* only show control panel on level 3 and sandbox */}
			{(currentLevel === LEVEL_NAMES.LEVEL_3 ||
				currentLevel === LEVEL_NAMES.SANDBOX) && (
				<>
					<h2 className="visually-hidden">ScottBrewBot Security Configuration</h2>
					<div className="defence-config-container">
						<DetailElement useIcon={true} buttonText={'Defence Configuration'}>
							<DefenceBox
								currentLevel={currentLevel}
								defences={nonModelDefences}
								showConfigurations={showConfigurations}
								resetDefenceConfiguration={resetDefenceConfiguration}
								toggleDefence={toggleDefence}
								setDefenceConfiguration={setDefenceConfiguration}
							/>
						</DetailElement>
					</div>
					<div className="model-config-container">
						<DetailElement useIcon={true} buttonText={'Model Configuration'}>
							<DefenceBox
								currentLevel={currentLevel}
								defences={modelDefences}
								showConfigurations={showConfigurations}
								toggleDefence={toggleDefence}
								resetDefenceConfiguration={resetDefenceConfiguration}
								setDefenceConfiguration={setDefenceConfiguration}
							/>
							{currentLevel === LEVEL_NAMES.SANDBOX && (
								<ModelBox
									chatModel={chatModel}
									setChatModelId={setChatModelId}
									chatModelOptions={chatModelOptions}
									addInfoMessage={addInfoMessage}
								/>
							)}
						</DetailElement>
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
