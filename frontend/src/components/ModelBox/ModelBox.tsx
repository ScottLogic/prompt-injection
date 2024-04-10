import { CHAT_MODEL_ID, ChatMessage, ChatModel } from '@src/models/chat';

import ModelConfiguration from './ModelConfiguration';
import ModelSelection from './ModelSelection';

import './ModelBox.css';

function ModelBox({
	chatModel,
	setChatModelId,
	chatModelOptions,
	addChatMessage,
}: {
	chatModel?: ChatModel;
	setChatModelId: (modelId: CHAT_MODEL_ID) => void;
	chatModelOptions: string[];
	addChatMessage: (chatMessage: ChatMessage) => void;
}) {
	return (
		<div className="model-box">
			<ModelSelection
				chatModel={chatModel}
				setChatModelId={setChatModelId}
				chatModelOptions={chatModelOptions}
				addChatMessage={addChatMessage}
			/>
			<ModelConfiguration
				chatModel={chatModel}
				addChatMessage={addChatMessage}
			/>
		</div>
	);
}

export default ModelBox;
