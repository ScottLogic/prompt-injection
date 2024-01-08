import { useState } from 'react';
import { TiTick, TiTimes } from 'react-icons/ti';

import { DEFENCE_ID, DefenceConfigItem, Defence } from '@src/models/defence';
import { validateDefence } from '@src/service/defenceService';

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
	const [showConfiguredText, setShowConfiguredText] = useState<boolean>(false);
	const [configValidated, setConfigValidated] = useState<boolean>(true);
	const [configKey, setConfigKey] = useState<number>(0);

	function showDefenceConfiguredText(isValid: boolean) {
		setShowConfiguredText(true);
		setConfigValidated(isValid);
		// hide the message after 3 seconds
		setTimeout(() => {
			setShowConfiguredText(false);
		}, 3000);
	}

	function resetConfigurationValue(defence: Defence, configId: string) {
		resetDefenceConfiguration(defence.id, configId);
		showDefenceConfiguredText(true);
	}

	async function setConfigurationValue(
		defence: Defence,
		configId: string,
		value: string
	) {
		const configIsValid = validateDefence(defence.id, configId, value);
		if (configIsValid) {
			const newConfiguration = defence.config.map((config) => {
				if (config.id === configId) {
					config.value = value;
				}
				return config;
			});

			const configured = await setDefenceConfiguration(
				defence.id,
				newConfiguration
			);
			showDefenceConfiguredText(configured);
		} else {
			showDefenceConfiguredText(false);
		}
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
				<summary className="defence-mechanism-summary">details</summary>
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

					{showConfiguredText &&
						(configValidated ? (
							<p className="validation-text">
								<TiTick /> defence successfully configured
							</p>
						) : (
							<p className="validation-text">
								<TiTimes /> invalid input - configuration failed
							</p>
						))}
				</div>
			</details>
		</fieldset>
	);
}

export default DefenceMechanism;
