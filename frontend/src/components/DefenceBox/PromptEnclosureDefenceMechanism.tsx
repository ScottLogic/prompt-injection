import { useState } from 'react';

import DefenceConfigurationRadioButton from '@src/components/ThemedButtons/DefenceConfigurationRadioButton';
import { DEFENCE_ID, Defence } from '@src/models/defence';

import DefenceConfiguration from './DefenceConfiguration';

function PromptEnclosureDefenceMechanism({
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

	const selectedDefence = getDefence(selectedRadio as DEFENCE_ID);

	return (
		<div className="defence-mechanism">
			<div className="defence-radio-buttons">
				<DefenceConfigurationRadioButton
					id="none"
					name="None"
					checked={isRadioSelected('none')}
					onChange={handleRadioChange}
				/>
				{defences.map((defence) => (
					<DefenceConfigurationRadioButton
						key={defence.id}
						id={defence.id}
						name={defence.name}
						checked={isRadioSelected(defence.id)}
						onChange={handleRadioChange}
					/>
				))}
			</div>
			<div className="prompt-enclosure-configuration-area">
				<p>{selectedRadio !== 'none' && selectedDefence.info}</p>
				{selectedRadio !== 'none' &&
					selectedDefence.config.map((config, index) => {
						return (
							<DefenceConfiguration
								key={index}
								defence={selectedDefence}
								isActive={selectedDefence.isActive}
								config={config}
								setConfigurationValue={setConfigurationValue}
								resetConfigurationValue={resetConfigurationValue}
							/>
						);
					})}
			</div>
		</div>
	);
}

export default PromptEnclosureDefenceMechanism;
