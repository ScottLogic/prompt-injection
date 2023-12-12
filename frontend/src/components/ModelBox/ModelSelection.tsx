// Path: frontend\src\components\ModelSelectionBox\ModelSelectionBox.tsx
import { useEffect, useState } from 'react';

import LoadingButton from '@src/components/ThemedButtons/LoadingButton';
import { setGptModel, getGptModel } from '@src/service/chatService';

import './ModelSelection.css';

// return a drop down menu with the models
function ModelSelection({ chatModelOptions }: { chatModelOptions: string[] }) {
	// model currently selected in the dropdown
	const [selectedModel, setSelectedModel] = useState<string | null>(null);
	// model in use by the app
	const [modelInUse, setModelInUse] = useState<string | null>(null);

	const [errorChangingModel, setErrorChangingModel] = useState(false);

	const [isSettingModel, setIsSettingModel] = useState(false);

	// handle button click to log the selected model
	async function submitSelectedModel() {
		if (!isSettingModel && selectedModel) {
			const currentSelectedModel = selectedModel;
			console.log(`selected model: ${currentSelectedModel}`);
			setIsSettingModel(true);
			const modelUpdated = await setGptModel(currentSelectedModel);
			setIsSettingModel(false);
			if (modelUpdated) {
				setModelInUse(currentSelectedModel);
				setErrorChangingModel(false);
			} else {
				setErrorChangingModel(true);
			}
		}
	}

	// get the model
	useEffect(() => {
		getGptModel()
			.then((model) => {
				setModelInUse(model.id);
				// default the dropdown selection to the model in use
				setSelectedModel(model.id);
			})
			.catch((err) => {
				console.log(err);
			});
	}, []);

	// return a drop down menu with the models
	return (
		<div className="model-selection-box">
			<div className="model-selection-row">
				<p>Select model: </p>
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
					>
						Choose
					</LoadingButton>
				</div>
			</div>

			<div className="model-selection-info">
				{errorChangingModel ? (
					<p className="error">
						Could not change model. You are still chatting to:
						<b> {modelInUse} </b>
					</p>
				) : (
					<p>
						{modelInUse ? (
							<>
								You are chatting to model: <b>{modelInUse}</b>
							</>
						) : (
							'You are not connected to a model.'
						)}
					</p>
				)}
			</div>
		</div>
	);
}

export default ModelSelection;
