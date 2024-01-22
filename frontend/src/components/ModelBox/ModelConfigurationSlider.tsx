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
	const [showInfo, setShowInfo] = useState<boolean>(false);

	function handleValueChange(
		_: Event | SyntheticEvent,
		value: number | number[]
	) {
		const val = Array.isArray(value) ? value[0] : value;
		setValue(val);
	}

	function toggleInfo() {
		setShowInfo(!showInfo);
	}

	useEffect(() => {
		setValue(config.value);
	}, [config]);

	return (
		<fieldset className="model-config-slider-fieldset">
			<legend>{config.name}</legend>
			<button
				className="info-icon prompt-injection-min-button"
				title="more info"
				aria-label="more info"
				onClick={() => {
					toggleInfo();
				}}
			>
				<AiOutlineInfoCircle aria-hidden />
			</button>
			{showInfo && <div className="info-text">{config.info}</div>}
			<div className="config-slider">
				<Slider
					aria-label={config.id}
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
						color: '#1fd07b',
					}}
				/>
			</div>
		</fieldset>
	);
}

export default ModelConfigurationSlider;
