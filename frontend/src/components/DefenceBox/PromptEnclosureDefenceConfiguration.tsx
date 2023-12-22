import { useState } from 'react';

import { DEFENCE_ID, Defence } from '@src/models/defence';

import DefenceConfiguration from './DefenceConfiguration';

import './PromptEnclosureDefenceConfiguration.css';

function PromptEnclosureDefenceConfiguration({
	defences,
	toggleDefence,
	setConfigurationValue,
	resetConfigurationValue,
}: {
	defences: Defence[];
	toggleDefence: (defence: Defence) => void;
	setConfigurationValue: (
		defence: Defence,
		configId: string,
		value: string
	) => Promise<void>;
	resetConfigurationValue: (defence: Defence, configId: string) => void;
}) {
	const [selectedRadio, setSelectedRadio] = useState<string>('none');

	function isRadioSelected(radioValue: string) {
		return radioValue === selectedRadio;
	}

	function getDefence(defenceId: DEFENCE_ID): Defence {
		return defences.find((defence) => defence.id === defenceId) ?? defences[0]; // todo = replace with safe
	}

	function deactivateAll() {
		defences.forEach((defence) => {
			if (defence.isActive) {
				toggleDefence(defence);
			}
		});
	}

	// activate this defence and deactivate all others
	function activateOne(defenceId: DEFENCE_ID) {
		defences.forEach((defence) => {
			if (defence.id === defenceId && !defence.isActive) toggleDefence(defence);
			else if (defence.isActive) {
				toggleDefence(defence);
			}
		});
	}

	function handleRadioChange(event: React.ChangeEvent<HTMLInputElement>) {
		setSelectedRadio(event.target.value);
		const defenceId = event.target.value;
		if (defenceId === 'none') {
			// set both defences to inactive
			deactivateAll();
		} else {
			// activate the selected defence and deactivate all others
			activateOne(defenceId as DEFENCE_ID);
		}
	}

	return (
		<div className="prompt-enclosure-defence-configuration">
			<div className="defence-radio-buttons">
				<label className="defence-radio-button">
					<input
						type="radio"
						name="prompt-enclosure-defence"
						value="none"
						checked={isRadioSelected('none')}
						onChange={handleRadioChange}
					/>
					<span className="checkmark"></span>
					<span className="label">None</span>
				</label>

				{defences.map((defence, index) => {
					return (
						<label className="defence-radio-button" key={index}>
							<input
								type="radio"
								name="prompt-enclosure-defence"
								value={defence.id}
								checked={isRadioSelected(defence.id)}
								onChange={handleRadioChange}
							/>
							<span className="checkmark"></span>
							<span className="label">{defence.name}</span>
						</label>
					);
				})}
			</div>
			{selectedRadio !== 'none' &&
				getDefence(selectedRadio as DEFENCE_ID).config.map((config, index) => {
					const defence = getDefence(selectedRadio as DEFENCE_ID);
					return (
						<DefenceConfiguration
							key={index}
							defence={defence}
							isActive={defence.isActive}
							config={config}
							setConfigurationValue={setConfigurationValue}
							resetConfigurationValue={resetConfigurationValue}
						/>
					);
				})}
		</div>
	);
}

export default PromptEnclosureDefenceConfiguration;
