import { useState } from 'react';

import DefenceConfigurationRadioButton from '@src/components/DefenceBox/DefenceConfigurationRadioButton';
import {
	DEFENCE_CONFIG_ITEM_ID,
	DEFENCE_ID,
	Defence,
} from '@src/models/defence';

import DefenceConfiguration from './DefenceConfiguration';

function PromptEnclosureDefenceMechanism({
	defences,
	showConfigurations,
	toggleDefence,
	setConfigurationValue,
	resetConfigurationValue,
}: {
	defences: Defence[];
	showConfigurations: boolean;
	toggleDefence: (defence: Defence) => void;
	setConfigurationValue: (
		defence: Defence,
		configId: string,
		value: string
	) => Promise<void>;
	resetConfigurationValue: (
		defence: Defence,
		configItemId: DEFENCE_CONFIG_ITEM_ID
	) => void;
}) {
	// Using local state, else we'd need to wait for API response before updating
	// selected radio. This could land us in trouble if there's a server error...
	const [selectedRadio, setSelectedRadio] = useState<DEFENCE_ID | 'off'>(
		defences.find((defence) => defence.isActive)?.id ?? 'off'
	);

	const selectedDefence = defences.find(
		(defence) => defence.id === selectedRadio
	);

	function handleRadioChange(selectedDefenceId: DEFENCE_ID | 'off') {
		setSelectedRadio(selectedDefenceId);

		defences.forEach((defence) => {
			// Activate selected (unless "off"), deactivate previously active
			if (defence.isActive || defence.id === selectedDefenceId) {
				toggleDefence(defence);
			}
		});
	}

	return (
		<>
			<div className="defence-radio-buttons">
				<DefenceConfigurationRadioButton
					id="off"
					name="Off"
					checked={selectedRadio === 'off'}
					onChange={() => {
						handleRadioChange('off');
					}}
				/>
				{defences.map((defence) => (
					<DefenceConfigurationRadioButton
						key={defence.id}
						id={defence.id}
						name={defence.name}
						checked={selectedRadio === defence.id}
						onChange={() => {
							handleRadioChange(defence.id);
						}}
					/>
				))}
			</div>
			{selectedDefence && (
				<>
					<p>{selectedDefence.info}</p>
					{showConfigurations &&
						selectedDefence.config.map((config, index) => (
							<DefenceConfiguration
								key={index}
								defence={selectedDefence}
								isActive={selectedDefence.isActive}
								config={config}
								setConfigurationValue={setConfigurationValue}
								resetConfigurationValue={resetConfigurationValue}
							/>
						))}
				</>
			)}
		</>
	);
}

export default PromptEnclosureDefenceMechanism;
