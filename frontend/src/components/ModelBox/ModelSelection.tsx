// Path: frontend\src\components\ModelSelectionBox\ModelSelectionBox.tsx
import { useEffect, useState } from 'react';

import LoadingButton from '@src/components/ThemedButtons/LoadingButton';
import { ChatModel } from '@src/models/chat';
import { chatService } from '@src/service';

import './ModelSelection.css';

// return a drop down menu with the models
function ModelSelection({
	chatModel,
	setChatModelId,
	chatModelOptions,
	addInfoMessage,
}: {
	chatModel?: ChatModel;
	setChatModelId: (modelId: string) => void;
	chatModelOptions: string[];
	addInfoMessage: (message: string) => void;
}) {
	// model currently selected in the dropdown
	const [selectedModel, setSelectedModel] = useState<string | null>(null);

	const [errorChangingModel, setErrorChangingModel] = useState(false);

	const [isSettingModel, setIsSettingModel] = useState(false);

	// handle button click to log the selected model
	async function submitSelectedModel() {
		if (!isSettingModel && selectedModel) {
			const currentSelectedModel = selectedModel;
			console.log(`selected model: ${currentSelectedModel}`);
			setIsSettingModel(true);
			const modelUpdated = await chatService.setGptModel(currentSelectedModel);
			setIsSettingModel(false);
			if (modelUpdated) {
				setErrorChangingModel(false);
				addInfoMessage(`changed model to ${currentSelectedModel}`);
				setChatModelId(currentSelectedModel);
			} else {
				setErrorChangingModel(true);
			}
		}
	}

	// get the model
	useEffect(() => {
		setSelectedModel(chatModel ? chatModel.id : null); // could we set it do underfined instead of null?
	}, [chatModel]);

	// return a drop down menu with the models
	return (
		<div className="model-selection-box">
			<fieldset className="model-selection-fieldset">
				<legend>Select Model</legend>
				<div className="model-selection-row">
					<div className="select-wrapper">
						<select
							aria-label="model-select"
							value={selectedModel ?? 0} // default to the first model
							onChange={(e) => {
								setSelectedModel(e.target.value);
							}}
						>
							{chatModelOptions.map((model) => (
								<option key={model} value={model}>
									{model}
								</option>
							))}
							;
						</select>
						<LoadingButton
							onClick={() => void submitSelectedModel()}
							isLoading={isSettingModel}
							loadingTooltip="Changing model..."
						>
							Choose
						</LoadingButton>
					</div>
				</div>

				<div className="model-selection-info">
					{errorChangingModel ? (
						<p className="error-message" aria-live="polite">
							Error: Could not change model. You are still chatting to:
							<b> {chatModel?.id} </b>
						</p>
					) : (
						<p>
							{chatModel ? (
								<>
									You are chatting to model: <b>{chatModel.id}</b>
								</>
							) : (
								'You are not connected to a model.'
							)}
						</p>
					)}
				</div>
			</fieldset>
		</div>
	);
}

export default ModelSelection;
