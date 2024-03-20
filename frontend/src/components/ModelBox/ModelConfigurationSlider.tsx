import { Slider } from '@mui/material';
import { useEffect, useState } from 'react';

import DetailElement from '@src/components/ThemedButtons/DetailElement';
import { CustomChatModelConfiguration, MODEL_CONFIG } from '@src/models/chat';

import './ModelConfigurationSlider.css';

function ModelConfigurationSlider({
	config,
	onConfigChanged,
}: {
	config: CustomChatModelConfiguration;
	onConfigChanged: (id: MODEL_CONFIG, newValue: number) => void;
}) {
	const [value, setValue] = useState<number>(config.value);

	function handleValueChange(_: Event, value: number | number[]) {
		const val = Array.isArray(value) ? value[0] : value;
		setValue(val);
	}

	function handleValueCommitted() {
		if (value !== config.value) {
			onConfigChanged(config.id, value);
		}
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
					onChangeCommitted={handleValueCommitted}
					sx={{
						color: '#2bb3bb',
					}}
				/>
			</div>
			<DetailElement useIcon={false}>
				<div className="info-text">{config.info}</div>
			</DetailElement>
		</fieldset>
	);
}

export default ModelConfigurationSlider;
