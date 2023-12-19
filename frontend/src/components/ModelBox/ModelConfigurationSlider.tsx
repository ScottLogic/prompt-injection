import { Slider } from '@mui/material';
import { useEffect, useState } from 'react';
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

	async function handleValueChange(_: Event, value: number | number[]) {
		const val = Array.isArray(value) ? value[0] : value;
		setValue(val);
		await configureGptModel(config.id, val);
	}

	function toggleInfo() {
		setShowInfo(!showInfo);
	}

	useEffect(() => {
		setValue(config.value);
	}, [config]);

	const supportText = `more info about ${config.name}`;

	return (
		<fieldset>
			<legend>{config.name}</legend>
			<button
				className="info-icon prompt-injection-min-button"
				title={supportText}
				aria-label={supportText}
				onClick={() => {
					toggleInfo();
				}}
			>
				<AiOutlineInfoCircle aria-hidden />
			</button>
			{showInfo && <div className="info-text">{config.info}</div>}
			<div className="model-config-slider">
				<Slider
					aria-label={config.id}
					getAriaValueText={(value) => `${value}`}
					aria-labelledby="slider"
					min={config.min}
					max={config.max}
					step={0.1}
					valueLabelDisplay="auto"
					value={value}
					onChange={(event, value) => void handleValueChange(event, value)}
					sx={{
						color: '#1fd07b',
					}}
				/>
			</div>
		</fieldset>
	);
}

export default ModelConfigurationSlider;
