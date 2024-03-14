import { ChatModel } from '@src/models/chat';

import ModelConfiguration from './ModelConfiguration';
import ModelSelection from './ModelSelection';

import './ModelBox.css';

function ModelBox({
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
	return (
		<div className="model-box">
			<ModelSelection
				chatModel={chatModel}
				setChatModelId={setChatModelId}
				chatModelOptions={chatModelOptions}
				addInfoMessage={addInfoMessage}
			/>
			<ModelConfiguration
				chatModel={chatModel}
				addInfoMessage={addInfoMessage}
			/>
		</div>
	);
}

export default ModelBox;
