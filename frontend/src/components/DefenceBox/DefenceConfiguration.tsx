import { useState } from 'react';

import ThemedButton from '@src/components/ThemedButtons/ThemedButton';
import { DEFENCE_ID, DefenceConfigItem } from '@src/models/defence';

import DefenceConfigurationInput from './DefenceConfigurationInput';

import './DefenceConfiguration.css';

function DefenceConfiguration({
	config,
	isActive,
	setConfigurationValue,
	resetConfigurationValue,
	defenceId,
}: {
	config: DefenceConfigItem;
	isActive: boolean;
	setConfigurationValue: (configId: string, value: string) => Promise<void>;
	resetConfigurationValue: (configId: string) => void;
	defenceId: DEFENCE_ID;
}) {
	const [inputKey, setInputKey] = useState<number>(0);

	async function setConfigurationValueIfDifferent(value: string) {
		if (value !== config.value) {
			await setConfigurationValue(config.id, value.trim());
			// re-render input in the event of a validation error
			setInputKey(inputKey + 1);
		}
	}

	const uniqueInputId = `${defenceId}-${config.id}`;
	const supportText = `reset ${config.name} to default`;

	return (
		<div className="defence-configuration">
			<div className="header">
				<label htmlFor={uniqueInputId}>{config.name}: </label>
				<ThemedButton
					onClick={() => {
						resetConfigurationValue(config.id);
					}}
					title={supportText}
					ariaLabel={supportText}
				>
					reset
				</ThemedButton>
			</div>
			<DefenceConfigurationInput
				id={uniqueInputId}
				key={inputKey}
				currentValue={config.value}
				disabled={!isActive}
				inputType={config.inputType}
				setConfigurationValue={(value) =>
					void setConfigurationValueIfDifferent(value)
				}
			/>
		</div>
	);
}

export default DefenceConfiguration;
