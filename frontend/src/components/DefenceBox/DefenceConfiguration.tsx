import { useState } from 'react';

import ThemedButton from '@src/components/ThemedButtons/ThemedButton';
import { DEFENCE_ID, Defence, DefenceConfigItem } from '@src/models/defence';

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
				// key={inputKey}
				currentValue={config.value}
				disabled={!isActive}
				inputType={config.inputType}
				setConfigurationValue={(value) =>
					setConfigurationValue(defence, config.id, value.trim())
				}
				defence={defence}
				config={config}
			/>
		</div>
	);
}

export default DefenceConfiguration;
