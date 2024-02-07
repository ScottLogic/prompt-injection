import ThemedButton from '@src/components/ThemedButtons/ThemedButton';
import { Defence, DefenceConfigItem } from '@src/models/defence';
import { defenceService } from '@src/service';

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

	function validateNewInput(value: string) {
		return defenceService.validateDefence(defence.id, config.id, value);
	}

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
				currentValue={config.value}
				disabled={!isActive}
				inputType={config.inputType}
				setConfigurationValue={(value) =>
					setConfigurationValue(defence, config.id, value.trim())
				}
				validateNewInput={validateNewInput}
			/>
		</div>
	);
}

export default DefenceConfiguration;
