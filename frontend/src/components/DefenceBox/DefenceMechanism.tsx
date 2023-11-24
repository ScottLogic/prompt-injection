import { useState } from 'react';
import { TiTick, TiTimes } from 'react-icons/ti';

import DefenceConfiguration from './DefenceConfiguration';

import { DEFENCE_TYPES, DefenceConfig, DefenceInfo } from '@src/models/defence';
import { validateDefence } from '@src/service/defenceService';

import './DefenceMechanism.css';

function DefenceMechanism({
	defenceDetail,
	showConfigurations,
	resetDefenceConfiguration,
	setDefenceActive,
	setDefenceInactive,
	setDefenceConfiguration,
}: {
	defenceDetail: DefenceInfo;
	showConfigurations: boolean;
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

	function resetConfigurationValue(configId: string) {
		resetDefenceConfiguration(defenceDetail.id, configId);
		showDefenceConfiguredText(true);
	}

	async function setConfigurationValue(configId: string, value: string) {
		const configIsValid = validateDefence(defenceDetail.id, value);
		if (configIsValid) {
			const newConfiguration = defenceDetail.config.map((config) => {
				if (config.id === configId) {
					config.value = value;
				}
				return config;
			});

			const configured = await setDefenceConfiguration(
				defenceDetail.id,
				newConfiguration
			);
			showDefenceConfiguredText(configured);
		} else {
			showDefenceConfiguredText(false);
		}
	}

	function toggleDefence() {
		defenceDetail.isActive
			? setDefenceInactive(defenceDetail)
			: setDefenceActive(defenceDetail);
	}

	return (
		<details
			className="defence-mechanism"
			onToggle={() => {
				// re-render the configuration component when detail is toggled
				// this is to resize the textarea when detail is expanded
				setConfigKey(configKey + 1);
			}}
		>
			<summary>
				<span aria-hidden>{defenceDetail.name}</span>
				<label className="switch">
					<input
						type="checkbox"
						placeholder="defence-toggle"
						onChange={toggleDefence}
						// set checked if defence is active
						checked={defenceDetail.isActive}
						aria-label={defenceDetail.name}
					/>
					<span className="slider round"></span>
				</label>
			</summary>
			<div className="info-box">
				<p>{defenceDetail.info}</p>
				{showConfigurations &&
					defenceDetail.config.map((config) => {
						return (
							<DefenceConfiguration
								key={config.id + configKey}
								isActive={defenceDetail.isActive}
								config={config}
								setConfigurationValue={setConfigurationValue}
								resetConfigurationValue={resetConfigurationValue}
							/>
						);
					})}
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
	);
}

export default DefenceMechanism;
