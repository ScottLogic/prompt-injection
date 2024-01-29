import { KeyboardEvent, useEffect, useState } from 'react';

import ThemedNumberInput from '@src/components/ThemedInput/ThemedNumberInput';
import ThemedTextArea from '@src/components/ThemedInput/ThemedTextArea';
import { Defence, DefenceConfigItem } from '@src/models/defence';
import { validateDefence } from '@src/service/defenceService';

function DefenceConfigurationInput({
	currentValue,
	disabled,
	inputType,
	setConfigurationValue,
	id,
	defence,
	config,
}: {
	currentValue: string;
	disabled: boolean;
	inputType: 'text' | 'number';
	setConfigurationValue: (value: string) => void;
	id: string;
	defence: Defence;
	config: DefenceConfigItem;
}) {
	const CONFIG_VALUE_CHARACTER_LIMIT = 5000;
	const [value, setValue] = useState<string>(currentValue);
	const [configValidated, setConfigValidated] = useState<boolean>(true);

	// update the text area value when reset/changed
	useEffect(() => {
		setValue(currentValue);
	}, [currentValue]);

	function inputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
		}
	}

	function inputKeyUp(event: KeyboardEvent<HTMLTextAreaElement>) {
		// shift+enter shouldn't send message
		if (event.key === 'Enter' && !event.shiftKey) {
			// asynchronously send the message
			setConfigurationValue(value);
		}
	}

	function validateNewInput(value: string) {
		if(validateDefence(defence.id, config.id, value)) {
			setConfigValidated(true);
		}
		else{
			setConfigValidated(false);
		}
	}

	function onClick() {
		setConfigurationValue(value);
	}

	if (inputType === 'text') {
		return (
			<>
			<ThemedTextArea
				id={id}
				content={value}
				onContentChanged={setValue}
				disabled={disabled}
				maxLines={10}
				onBlur={() => {
					validateNewInput(value);
				}}
				onKeyDown={inputKeyDown}
				onKeyUp={inputKeyUp}
				characterLimit={CONFIG_VALUE_CHARACTER_LIMIT}
				configValidated={configValidated}
				validateInput={validateNewInput}
			/>
			{configValidated ?<button onClick={onClick}>ok</button> : ''}
			<p className="invalid-text">
				{configValidated ? '' : 'Invalid configuration value'}
			</p>
			</>
		);
	} else {
		return (
			<>
			<ThemedNumberInput
				id={id}
				content={value}
				onContentChanged={setValue}
				disabled={disabled}
				enterPressed={() => {
					setConfigurationValue(value);
				}}
				onBlur={() => {
					setConfigurationValue(value);
				}}
			/>
			<p className="invalid-text">
				{configValidated ? '' : 'Invalid configuration value'}
			</p>
			</>
		);
	}
}

export default DefenceConfigurationInput;
