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
import { useState } from 'react';

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

	const [isButtonOneExpanded, setIsButtonOneExpanded] = useState(
		document.getElementById('dw-button-one')?.getAttribute('aria-expanded') ===
			'true'
	);
	const [isButtonTwoExpanded, setIsButtonTwoExpanded] = useState(
		document.getElementById('dw-button-two')?.getAttribute('aria-expanded') ===
			'true'
	);

	function handleButtonOneClick() {
		const button = document.querySelector('.dw-button-one');
		if (button) {
			const isExpanded = button.getAttribute('aria-expanded') === 'true';
			button.setAttribute('aria-expanded', String(!isExpanded));
			setIsButtonOneExpanded(!isExpanded);
		}
	}
	function handleButtonTwoClick() {
		const button = document.querySelector('.dw-button-two');
		if (button) {
			const isExpanded = button.getAttribute('aria-expanded') === 'true';
			button.setAttribute('aria-expanded', String(!isExpanded));
			setIsButtonTwoExpanded(!isExpanded);
		}
	}

	return (
		<div className="control-panel">
			{/* only show control panel on level 3 and sandbox */}
			{(currentLevel === LEVEL_NAMES.LEVEL_3 ||
				currentLevel === LEVEL_NAMES.SANDBOX) && (
				<>
					<h2 className="visually-hidden">ScottBrew System Access</h2>
					<h3>ScottBrew System Access</h3>
					{/* <button>expand all</button> */}
					<button
						type="button"
						aria-expanded="false"
						className="dw-button-one control-collapsible-section-header"
						onClick={handleButtonOneClick}
					>
						<span className="button-arrow-icon" aria-hidden>
							{isButtonOneExpanded ? '\u2B9F' : '\u2B9E'}&nbsp;
						</span>
						Defence Configuration
					</button>
					<div className="dw-panel-one">
						<DefenceBox
							currentLevel={currentLevel}
							defences={nonModelDefences}
							showConfigurations={showConfigurations}
							resetDefenceConfiguration={resetDefenceConfiguration}
							toggleDefence={toggleDefence}
							setDefenceConfiguration={setDefenceConfiguration}
						/>
					</div>

					{/* <details className="control-collapsible-section">
						<summary className="control-collapsible-section-header">
							Defence Configuration
						</summary>
						<DefenceBox
							currentLevel={currentLevel}
							defences={nonModelDefences}
							showConfigurations={showConfigurations}
							resetDefenceConfiguration={resetDefenceConfiguration}
							toggleDefence={toggleDefence}
							setDefenceConfiguration={setDefenceConfiguration}
						/>
					</details> */}

					<button
						type="button"
						aria-expanded="false"
						className="dw-button-two control-collapsible-section-header"
						onClick={handleButtonTwoClick}
					>
						<span className="button-arrow-icon" aria-hidden>
							{isButtonTwoExpanded ? '\u2B9F' : '\u2B9E'}&nbsp;
						</span>
						Model Configuration
					</button>
					<div className="dw-panel-two">
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
								chatModelOptions={chatModelOptions}
								addInfoMessage={addInfoMessage}
							/>
						)}
					</div>

					{/* <details className="control-collapsible-section">
						<summary className="control-collapsible-section-header">
							Model Configuration
						</summary>
						<DefenceBox
							currentLevel={currentLevel}
							defences={modelDefences}
							showConfigurations={showConfigurations}
							toggleDefence={toggleDefence}
							resetDefenceConfiguration={resetDefenceConfiguration}
							setDefenceConfiguration={setDefenceConfiguration}
						/> */}

					{/* only show model box in sandbox mode */}
					{/* {showConfigurations && (
							<ModelBox
								chatModel={chatModel}
								setChatModelId={setChatModelId}
								chatModelOptions={chatModelOptions}
								addInfoMessage={addInfoMessage}
							/>
						)}
					</details> */}
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
