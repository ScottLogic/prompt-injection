import { Slider } from '@mui/material';
import { SyntheticEvent, useEffect, useState } from 'react';
import { AiOutlineInfoCircle } from 'react-icons/ai';


import { CustomChatModelConfiguration } from '@src/models/chat';
import { configureGptModel } from '@src/service/chatService';

import './ModelConfigurationSlider.css';

function ModelConfigurationSlider({
	config,
}: {
	config: CustomChatModelConfiguration;
}) {
	const [value, setValue] = useState<number>(config.value);

	function handleValueChange(
		_: Event | SyntheticEvent,
		value: number | number[]
	) {
		const val = Array.isArray(value) ? value[0] : value;
		setValue(val);
	}

	useEffect(() => {
		setValue(config.value);
	}, [config]);

	return (
		<fieldset className="model-config-slider-fieldset">
			<legend>{config.name}</legend>
			<div className="config-slider">
				<Slider
					getAriaValueText={(value) => `${value}`}
					min={config.min}
					max={config.max}
					step={0.1}
					valueLabelDisplay="auto"
					value={value}
					onChange={handleValueChange}
					onChangeCommitted={() => {
						void configureGptModel(config.id, value);
					}}
					sx={{
						color: '#2bb3bb',
					}}
				/>
			</div>
			<details title="more info">
				<summary>Details</summary>
				<div className="info-text">{config.info}</div>
			</details>
		</fieldset>
	);
}

export default ModelConfigurationSlider;
