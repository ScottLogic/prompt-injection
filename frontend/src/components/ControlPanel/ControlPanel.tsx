import DefenceBox from '@src/components/DefenceBox/DefenceBox';
import DocumentViewButton from '@src/components/DocumentViewer/DocumentViewButton';
import ModelBox from '@src/components/ModelBox/ModelBox';
import SwitchModeButton from '@src/components/ThemedButtons/SwitchModeButton';
import { DEFENCE_TYPES, DefenceConfig, DefenceInfo } from '@src/models/defence';
import { LEVEL_NAMES } from '@src/models/level';

import './ControlPanel.css';

function ControlPanel({
	currentLevel,
	defences,
	chatModelOptions,
	resetDefenceConfiguration,
	setDefenceActive,
	setDefenceInactive,
	setDefenceConfiguration,
	openWelcomeOverlay,
}: {
	currentLevel: LEVEL_NAMES;
	defences: DefenceInfo[];
	chatModelOptions: string[];
	resetDefenceConfiguration: (
		defenceId: DEFENCE_TYPES,
		configId: string
	) => void;
	setDefenceActive: (defence: DefenceInfo) => void;
	setDefenceInactive: (defence: DefenceInfo) => void;
	setDefenceConfiguration: (
		defenceId: DEFENCE_TYPES,
		config: DefenceConfig[]
	) => Promise<boolean>;
	openWelcomeOverlay: () => void;
}) {
	function getDefencesConfigure() {
		return defences.filter((defence) => {
			return ![
				DEFENCE_TYPES.PROMPT_EVALUATION_LLM,
				DEFENCE_TYPES.QA_LLM,
				DEFENCE_TYPES.SYSTEM_ROLE,
			].some((id) => id === defence.id);
		});
	}

	function getDefencesModel() {
		return defences.filter((defence) => {
			return [
				DEFENCE_TYPES.PROMPT_EVALUATION_LLM,
				DEFENCE_TYPES.QA_LLM,
				DEFENCE_TYPES.SYSTEM_ROLE,
			].some((id) => id === defence.id);
		});
	}

	// only allow configuration in sandbox
	const showConfigurations = currentLevel === LEVEL_NAMES.SANDBOX;

	return (
		<div className="control-panel">
			{/* only show control panel on level 3 and sandbox */}
			{(currentLevel === LEVEL_NAMES.LEVEL_3 ||
				currentLevel === LEVEL_NAMES.SANDBOX) && (
				<>
					<details className="control-collapsible-section">
						<summary className="control-collapsible-section-header">
							Defence Configuration
						</summary>
						<DefenceBox
							currentLevel={currentLevel}
							defences={getDefencesConfigure()}
							showConfigurations={showConfigurations}
							resetDefenceConfiguration={resetDefenceConfiguration}
							setDefenceActive={setDefenceActive}
							setDefenceInactive={setDefenceInactive}
							setDefenceConfiguration={setDefenceConfiguration}
						/>
					</details>

					<details className="control-collapsible-section">
						<summary className="control-collapsible-section-header">
							Model Configuration
						</summary>
						<DefenceBox
							currentLevel={currentLevel}
							defences={getDefencesModel()}
							showConfigurations={showConfigurations}
							resetDefenceConfiguration={resetDefenceConfiguration}
							setDefenceActive={setDefenceActive}
							setDefenceInactive={setDefenceInactive}
							setDefenceConfiguration={setDefenceConfiguration}
						/>

						{/* only show model box in sandbox mode */}
						{showConfigurations && (
							<ModelBox chatModelOptions={chatModelOptions} />
						)}
					</details>
				</>
			)}

			{/* only show document viewer button in sandbox mode */}
			{currentLevel === LEVEL_NAMES.SANDBOX && <DocumentViewButton />}
			<SwitchModeButton
				currentLevel={currentLevel}
				onClick={() => {
					openWelcomeOverlay();
				}}
			/>
		</div>
	);
}

export default ControlPanel;
