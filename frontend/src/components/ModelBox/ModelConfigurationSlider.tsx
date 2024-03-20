import { Slider } from '@mui/material';
import { SyntheticEvent, useEffect, useState } from 'react';

import { CustomChatModelConfiguration, MODEL_CONFIG } from '@src/models/chat';

import './ModelConfigurationSlider.css';
import DetailElement from '@src/components/ThemedButtons/DetailElement';

function ModelConfigurationSlider({
	config,
	onConfigChanged,
}: {
	config: CustomChatModelConfiguration;
	onConfigChanged: (id: MODEL_CONFIG, newValue: number) => void;
}) {
	const [value, setValue] = useState<number>(config.value);

	function handleValueChange(
		_: Event | SyntheticEvent,
		value: number | number[]
	) {
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

	// TODO Fix this to use new DetailElement !!
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
