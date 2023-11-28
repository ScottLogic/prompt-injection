import { useState } from 'react';

import ThemedButton from '@src/components/ThemedButtons/ThemedButton';
import { DefenceConfig } from '@src/models/defence';

import DefenceConfigurationInput from './DefenceConfigurationInput';

import './DefenceConfiguration.css';

function DefenceConfiguration({
	config,
	isActive,
	setConfigurationValue,
	resetConfigurationValue,
}: {
	config: DefenceConfig;
	isActive: boolean;
	setConfigurationValue: (configId: string, value: string) => Promise<void>;
	resetConfigurationValue: (configId: string) => void;
}) {
	const [inputKey, setInputKey] = useState<number>(0);

	async function setConfigurationValueIfDifferent(value: string) {
		if (value !== config.value) {
			await setConfigurationValue(config.id, value.trim());
			// re-render input in the event of a validation error
			setInputKey(inputKey + 1);
		}
	}

	return (
		<div className="defence-configuration">
			<div className="header">
				<span>{config.name}: </span>
				<ThemedButton
					onClick={() => {
						resetConfigurationValue(config.id);
					}}
					title="reset to default"
				>
					reset
				</ThemedButton>
			</div>
			<DefenceConfigurationInput
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
