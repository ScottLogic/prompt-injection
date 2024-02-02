import { KeyboardEvent, useEffect, useState } from 'react';

import ThemedNumberInput from '@src/components/ThemedInput/ThemedNumberInput';
import ThemedTextArea from '@src/components/ThemedInput/ThemedTextArea';

function DefenceConfigurationInput({
	currentValue,
	disabled,
	inputType,
	setConfigurationValue,
	id,
	validateNewInput,
}: {
	currentValue: string;
	disabled: boolean;
	inputType: 'text' | 'number';
	setConfigurationValue: (value: string) => Promise<void>;
	id: string;
	validateNewInput: (value: string) => boolean;
}) {
	const CONFIG_VALUE_CHARACTER_LIMIT = 5000;
	const [value, setValue] = useState<string>(currentValue);
	const [isConfigValid, setIsConfigValid] = useState<boolean>(true);

	// update the text area value when reset/changed
	useEffect(() => {
		setValue(currentValue);
	}, [currentValue]);

	async function setConfigurationValueIfDifferent(value: string) {
		const trimmedValue = value.trim();
		if (trimmedValue !== currentValue) {
			if (isConfigValid) {
				await setConfigurationValue(trimmedValue);
				setValue(trimmedValue);
			} else {
				setValue(currentValue);
				setIsConfigValid(true);
			}
		} else {
			setValue(trimmedValue);
		}
	}

	function inputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
		}
	}

	function inputKeyUp(event: KeyboardEvent<HTMLTextAreaElement>) {
		// shift+enter shouldn't send message
		if (event.key === 'Enter' && !event.shiftKey) {
			// asynchronously send the message
			void setConfigurationValueIfDifferent(value);
		}
	}

	function handleChange(value: string) {
		setValue(value);
		setIsConfigValid(validateNewInput(value));
	}

	const inputElement =
		inputType === 'text' ? (
			<ThemedTextArea
				id={id}
				content={value}
				onContentChanged={handleChange}
				valueInvalid={!isConfigValid}
				disabled={disabled}
				maxLines={10}
				onBlur={() => {
					void setConfigurationValueIfDifferent(value);
				}}
				onKeyDown={inputKeyDown}
				onKeyUp={inputKeyUp}
				characterLimit={CONFIG_VALUE_CHARACTER_LIMIT}
			/>
		) : (
			<ThemedNumberInput
				id={id}
				content={value}
				onContentChanged={handleChange}
				valueInvalid={!isConfigValid}
				disabled={disabled}
				enterPressed={() => {
					void setConfigurationValueIfDifferent(value);
				}}
				onBlur={() => {
					void setConfigurationValueIfDifferent(value);
				}}
			/>
		);

	return (
		<>
			{inputElement}
			{!isConfigValid && (
				<p className="error-message" aria-live="polite">
					Error: Invalid configuration value
				</p>
			)}
		</>
	);
}

export default DefenceConfigurationInput;
