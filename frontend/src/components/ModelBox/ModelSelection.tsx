// Path: frontend\src\components\ModelSelectionBox\ModelSelectionBox.tsx
import { useEffect, useState } from 'react';

import LoadingButton from '@src/components/ThemedButtons/LoadingButton';
import { CHAT_MODEL_ID, ChatMessage, ChatModel } from '@src/models/chat';
import { chatService } from '@src/service';

import './ModelSelection.css';

// return a drop down menu with the models
function ModelSelection({
	chatModel,
	setChatModelId,
	chatModelOptions,
	addChatMessage,
}: {
	chatModel?: ChatModel;
	setChatModelId: (modelId: CHAT_MODEL_ID) => void;
	chatModelOptions: string[];
	addChatMessage: (message: ChatMessage) => void;
}) {
	// model currently selected in the dropdown
	const [selectedModel, setSelectedModel] = useState<CHAT_MODEL_ID | undefined>(
		undefined
	);

	const [errorChangingModel, setErrorChangingModel] = useState(false);

	const [isSettingModel, setIsSettingModel] = useState(false);

	// handle button click to log the selected model
	async function submitSelectedModel() {
		if (!isSettingModel && selectedModel) {
			const currentSelectedModel = selectedModel;
			console.log(`selected model: ${currentSelectedModel}`);
			setIsSettingModel(true);
			const chatInfoMessage = await chatService.setGptModel(
				currentSelectedModel
			);
			setIsSettingModel(false);
			if (chatInfoMessage) {
				setErrorChangingModel(false);
				addChatMessage(chatInfoMessage);
				setChatModelId(currentSelectedModel);
			} else {
				setErrorChangingModel(true);
			}
		}
	}

	// get the model
	useEffect(() => {
		setSelectedModel(chatModel?.id);
	}, [chatModel]);

	// return a drop down menu with the models
	return (
		<div className="model-selection-box">
			<fieldset className="model-selection-fieldset">
				<legend>Select Model</legend>
				{chatModel ? (
					<>
						<div className="model-selection-row">
							<div className="select-wrapper">
								<select
									aria-label="model-select"
									value={selectedModel ?? 0} // default to the first model
									onChange={(e) => {
										setSelectedModel(e.target.value as CHAT_MODEL_ID);
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
									<b> {chatModel.id} </b>
								</p>
							) : (
								<p>
									You are chatting to model: <b>{chatModel.id}</b>
								</p>
							)}
						</div>
					</>
				) : (
					<p>Loading chatModel...</p>
				)}
			</fieldset>
		</div>
	);
}

export default ModelSelection;
