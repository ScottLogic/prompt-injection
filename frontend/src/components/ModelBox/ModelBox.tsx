import { ChatMessage, ChatModel } from '@src/models/chat';

import ModelConfiguration from './ModelConfiguration';
import ModelSelection from './ModelSelection';

import './ModelBox.css';

function ModelBox({
	chatModel,
	setChatModelId,
	chatModelOptions,
	addInfoMessage,
	addChatMessage,
}: {
	chatModel?: ChatModel;
	setChatModelId: (modelId: string) => void;
	chatModelOptions: string[];
	addInfoMessage: (message: string) => void;
	addChatMessage: (chatMessage: ChatMessage) => void;
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
				addChatMessage={addChatMessage}
			/>
		</div>
	);
}

export default ModelBox;
