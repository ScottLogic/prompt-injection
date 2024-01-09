import { useState } from 'react';

import ThemedButton from '@src/components/ThemedButtons/ThemedButton';
import { Defence, DefenceConfigItem } from '@src/models/defence';

import DefenceConfigurationInput from './DefenceConfigurationInput';

import './DefenceConfiguration.css';

function DefenceConfiguration({
	defence,
	config,
	isActive,
	setConfigurationValue,
	resetConfigurationValue,
}: {
	defence: Defence;
	config: DefenceConfigItem;
	isActive: boolean;
	setConfigurationValue: (
		defence: Defence,
		configId: string,
		value: string
	) => Promise<void>;
	resetConfigurationValue: (defence: Defence, configId: string) => void;
}) {
	const [inputKey, setInputKey] = useState<number>(0);

	async function setConfigurationValueIfDifferent(value: string) {
		if (value !== config.value) {
			await setConfigurationValue(defence, config.id, value.trim());
			// re-render input in the event of a validation error
			setInputKey(inputKey + 1);
		}
	}

	const uniqueInputId = `${defence.id}-${config.id}`;
	const supportText = `reset ${config.name} to default`;

	return (
		<div className="defence-configuration">
			<div className="header">
				<label htmlFor={uniqueInputId}>{config.name}: </label>
				<ThemedButton
					onClick={() => {
						resetConfigurationValue(defence, config.id);
					}}
					ariaLabel={supportText}
					tooltip={{
						id: `reset-${config.id}`,
						text: supportText,
					}}
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
