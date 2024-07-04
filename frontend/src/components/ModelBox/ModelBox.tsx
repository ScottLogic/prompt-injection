import { ChatMessage, ChatModel } from '@src/models/chat';

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
	setChatModelId: (modelId: ChatModel['id']) => void;
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
