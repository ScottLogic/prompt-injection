import DefenceBox from '@src/components/DefenceBox/DefenceBox';
import DocumentViewButton from '@src/components/DocumentViewer/DocumentViewButton';
import ModelBox from '@src/components/ModelBox/ModelBox';
import SwitchModeButton from '@src/components/ThemedButtons/SwitchModeButton';
import { DEFENCE_ID, DefenceConfigItem, Defence } from '@src/models/defence';
import { LEVEL_NAMES } from '@src/models/level';

import './ControlPanel.css';

function ControlPanel({
	currentLevel,
	defences,
	resetDefenceConfiguration,
	setDefenceActive,
	setDefenceInactive,
	setDefenceConfiguration,
	openWelcomeOverlay,
}: {
	currentLevel: LEVEL_NAMES;
	defences: Defence[];
	resetDefenceConfiguration: (defenceId: DEFENCE_ID, configId: string) => void;
	setDefenceActive: (defence: Defence) => void;
	setDefenceInactive: (defence: Defence) => void;
	setDefenceConfiguration: (
		defenceId: DEFENCE_ID,
		config: DefenceConfigItem[]
	) => Promise<boolean>;
	openWelcomeOverlay: () => void;
}) {
	function getDefencesConfigure() {
		return defences.filter((defence) => {
			return ![
				DEFENCE_ID.PROMPT_EVALUATION_LLM,
				DEFENCE_ID.QA_LLM,
				DEFENCE_ID.SYSTEM_ROLE,
			].some((id) => id === defence.id);
		});
	}

	function getDefencesModel() {
		return defences.filter((defence) => {
			return [
				DEFENCE_ID.PROMPT_EVALUATION_LLM,
				DEFENCE_ID.QA_LLM,
				DEFENCE_ID.SYSTEM_ROLE,
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
						{showConfigurations && <ModelBox />}
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
