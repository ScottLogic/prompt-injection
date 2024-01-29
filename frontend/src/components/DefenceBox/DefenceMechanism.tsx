import { useState } from 'react';

import { DEFENCE_ID, DefenceConfigItem, Defence } from '@src/models/defence';

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
}: {
	defenceDetail: Defence;
	showConfigurations: boolean;
	promptEnclosureDefences: Defence[];
	toggleDefence: (defence: Defence) => void;
	resetDefenceConfiguration: (defenceId: DEFENCE_ID, configId: string) => void;
	setDefenceConfiguration: (
		defenceId: DEFENCE_ID,
		config: DefenceConfigItem[]
	) => Promise<boolean>;
}) {
	const [configKey, setConfigKey] = useState<number>(0);

	function resetConfigurationValue(defence: Defence, configId: string) {
		resetDefenceConfiguration(defence.id, configId);
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
			<details
				className="defence-mechanism"
				onToggle={() => {
					// re-render the configuration component when detail is toggled
					// this is to resize the textarea when detail is expanded
					setConfigKey(configKey + 1);
				}}
			>
				<summary className="defence-mechanism-summary">Details</summary>
				<div className="info-box">
					<p>{defenceDetail.info}</p>

					{defenceDetail.id !== DEFENCE_ID.PROMPT_ENCLOSURE ? (
						showConfigurations &&
						defenceDetail.config.map((config) => {
							return (
								<DefenceConfiguration
									defence={defenceDetail}
									key={config.id + configKey}
									isActive={defenceDetail.isActive}
									config={config}
									setConfigurationValue={setConfigurationValue}
									resetConfigurationValue={resetConfigurationValue}
								/>
							);
						})
					) : (
						<PromptEnclosureDefenceMechanism
							defences={promptEnclosureDefences}
							toggleDefence={toggleDefence}
							showConfigurations={showConfigurations}
							setConfigurationValue={setConfigurationValue}
							resetConfigurationValue={resetConfigurationValue}
						/>
					)}
				</div>
			</details>
		</fieldset>
	);
}

export default DefenceMechanism;
