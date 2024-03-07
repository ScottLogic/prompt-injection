import { useState } from 'react';

import {
	DEFENCE_ID,
	DefenceConfigItem,
	Defence,
	DEFENCE_CONFIG_ITEM_ID,
} from '@src/models/defence';

import DefenceConfiguration from './DefenceConfiguration';
import PromptEnclosureDefenceMechanism from './PromptEnclosureDefenceMechanism';

import './DefenceMechanism.css';

function DefenceMechanism({
	defenceDetail,
	showConfigurations,
	promptEnclosureDefences,
	toggleDefence,
	resetDefenceConfiguration,
	setDefenceConfiguration,
	contentHidden,
	toggleButtonState,
	configKey,
}: {
	defenceDetail: Defence;
	showConfigurations: boolean;
	promptEnclosureDefences: Defence[];
	toggleDefence: (defence: Defence) => void;
	resetDefenceConfiguration: (
		defenceId: DEFENCE_ID,
		configItemId: DEFENCE_CONFIG_ITEM_ID
	) => void;
	setDefenceConfiguration: (
		defenceId: DEFENCE_ID,
		config: DefenceConfigItem[]
	) => Promise<boolean>;
	contentHidden: (buttonId: string) => boolean;
	toggleButtonState: (buttonId: string) => void;
	configKey: number;
}) {
	const [newConfigKey, setNewConfigKey] = useState<number>(configKey);

	function resetConfigurationValue(
		defence: Defence,
		configItemId: DEFENCE_CONFIG_ITEM_ID
	) {
		resetDefenceConfiguration(defence.id, configItemId);
	}

	async function setConfigurationValue(
		defence: Defence,
		configId: string,
		value: string
	) {
		const newConfiguration = defence.config.map((config) => {
			if (config.id === configId) {
				config.value = value;
			}
			return config;
		});
		await setDefenceConfiguration(defence.id, newConfiguration);
	}

	return (
		<fieldset className="defence-mechanism-fieldset">
			<legend className="defence-mechanism-legend">{defenceDetail.name}</legend>
			{defenceDetail.id !== DEFENCE_ID.PROMPT_ENCLOSURE && (
				<form className="defence-mechanism-form">
					<div className="toggles">
						<input
							id={defenceDetail.id}
							className="toggle-switch-input"
							type="checkbox"
							placeholder="defence-toggle"
							onChange={() => {
								toggleDefence(defenceDetail);
							}}
							// set checked if defence is active
							checked={defenceDetail.isActive}
						/>
						<label htmlFor={defenceDetail.id}>
							{defenceDetail.isActive ? 'on' : 'off'}
						</label>
					</div>
				</form>
			)}
			{defenceDetail.id !== DEFENCE_ID.PROMPT_ENCLOSURE ? (
				showConfigurations &&
				defenceDetail.config.map((config) => {
					return (
						<>
							<button
								type="button"
								aria-expanded={contentHidden(config.id + defenceDetail.id)}
								className="details-button"
								onClick={() => {
									toggleButtonState(config.id + defenceDetail.id);
									setNewConfigKey(newConfigKey + 1);
								}}
							>
								Details
							</button>
							<div className="details-panel">
								<p>{defenceDetail.info}</p>
								<DefenceConfiguration
									defence={defenceDetail}
									key={config.id + configKey}
									isActive={defenceDetail.isActive}
									config={config}
									setConfigurationValue={setConfigurationValue}
									resetConfigurationValue={resetConfigurationValue}
								/>
							</div>
						</>
					);
				})
			) : (
				<>
					<button
						type="button"
						aria-expanded={contentHidden('details-for-prompt-enclosure')}
						className="details-button"
						onClick={() => {
							toggleButtonState('details-for-prompt-enclosure');
						}}
					>
						Details
					</button>
					<div className="details-panel">
						<p>{defenceDetail.info}</p>

						<PromptEnclosureDefenceMechanism
							defences={promptEnclosureDefences}
							toggleDefence={toggleDefence}
							showConfigurations={showConfigurations}
							setConfigurationValue={setConfigurationValue}
							resetConfigurationValue={resetConfigurationValue}
						/>
					</div>
				</>
			)}
		</fieldset>
	);
}

export default DefenceMechanism;
