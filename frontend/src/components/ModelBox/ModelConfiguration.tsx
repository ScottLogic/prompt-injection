import { useEffect, useState } from 'react';

import {
	ChatModel,
	CustomChatModelConfiguration,
	MODEL_CONFIG,
} from '@src/models/chat';
import { chatService } from '@src/service';

import ModelConfigurationSlider from './ModelConfigurationSlider';

import './ModelConfiguration.css';

const DEFAULT_CONFIGS: CustomChatModelConfiguration[] = [
	{
		id: MODEL_CONFIG.TEMPERATURE,
		name: 'Model Temperature',
		info: 'Controls the randomness of the model. Lower means more deterministic, higher means more surprising. Default is 1.',
		value: 1,
		min: 0,
		max: 2,
	},
	{
		id: MODEL_CONFIG.TOP_P,
		name: 'Top P',
		info: 'Controls how many different words or phrases the language model considers when it’s trying to predict the next word. Default is 1. ',
		value: 1,
		min: 0,
		max: 1,
	},
	{
		id: MODEL_CONFIG.PRESENCE_PENALTY,
		name: 'Presence Penalty',
		info: 'Controls diversity of text generation. Higher presence penalty increases likelihood of using new words. Default is 0.',
		value: 0,
		min: 0,
		max: 2,
	},
	{
		id: MODEL_CONFIG.FREQUENCY_PENALTY,
		name: 'Frequency Penalty',
		info: 'Controls diversity of text generation. Higher frequency penalty decreases likelihood of using the same words. Default is 0.',
		value: 0,
		min: 0,
		max: 2,
	},
];

function ModelConfiguration({
	chatModel,
	addInfoMessage,
}: {
	chatModel?: ChatModel;
	addInfoMessage: (message: string) => void;
}) {
	const [customChatModelConfigs, setCustomChatModel] =
		useState<CustomChatModelConfiguration[]>(DEFAULT_CONFIGS);

	function setCustomChatModelByID(id: MODEL_CONFIG, value: number) {
		setCustomChatModel((prev) => {
			return prev.map((config) => {
				if (config.id === id) {
					return { ...config, value };
				}
				return config;
			});
		});
	}

	function updateConfigValue(id: MODEL_CONFIG, newValue: number) {
		const prevValue = customChatModelConfigs.find(
			(config) => config.id === id
		)?.value;

		if (prevValue === undefined)
			throw new Error(`ModelConfiguration: No config with id: ${id}`);

		setCustomChatModelByID(id, newValue);

		void chatService.configureGptModel(id, newValue).then((success) => {
			if (success) {
				addInfoMessage(`changed ${id} to ${newValue}`);
			} else {
				setCustomChatModelByID(id, prevValue);
			}
		});
	}

	useEffect(() => {
		if (!chatModel) {
			// chatModel is undefined if this is the first time that the user has switched to the sandbox level
			// and the change level request has not yet resolved successfully
			return;
		}
		const newCustomChatModelConfigs = customChatModelConfigs.map((config) => ({
			...config,
			value: chatModel.configuration[config.id],
		}));
		setCustomChatModel(newCustomChatModelConfigs);
	}, [chatModel]);

	return (
		<div className="model-config-box">
			{customChatModelConfigs.map((config) => (
				<ModelConfigurationSlider
					key={config.id}
					config={config}
					onConfigChanged={updateConfigValue}
				/>
			))}
		</div>
	);
}

export default ModelConfiguration;
