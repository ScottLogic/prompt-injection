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
	const [inputInvalid, setInputInvalid] = useState<boolean>(false);

	// update the text area value when reset/changed
	useEffect(() => {
		setValue(currentValue);
	}, [currentValue]);

	async function setConfigurationValueIfDifferent(value: string) {
		const trimmedValue = value.trim();
		if (trimmedValue !== currentValue) {
			if (!inputInvalid) {
				await setConfigurationValue(trimmedValue);
				setValue(trimmedValue);
			} else {
				setValue(currentValue);
				// after resetting to last valid value, remove the error message
				setInputInvalid(false);
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

	function isInputInvalid(value: string) {
		setInputInvalid(!validateNewInput(value));
	}

	const inputElement =
		inputType === 'text' ? (
			<ThemedTextArea
				id={id}
				content={value}
				onContentChanged={setValue}
				inputInvalid={inputInvalid}
				validateInput={isInputInvalid}
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
				onContentChanged={setValue}
				inputInvalid={inputInvalid}
				validateInput={isInputInvalid}
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
			{inputInvalid && (
				<p className="error-message" aria-live="polite">
					Error: Invalid configuration value
				</p>
			)}
		</>
	);
}

export default DefenceConfigurationInput;
