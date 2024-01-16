import { ChatMessage } from '@src/models/chat';

import ModelConfiguration from './ModelConfiguration';
import ModelSelection from './ModelSelection';

import './ModelBox.css';

function ModelBox({
	chatModelOptions,
	addChatMessage,
}: {
	chatModelOptions: string[];
	addChatMessage: (message: ChatMessage) => void;
}) {
	return (
		<div className="model-box">
			<ModelSelection
				chatModelOptions={chatModelOptions}
				addChatMessage={addChatMessage}
			/>
			<ModelConfiguration addChatMessage={addChatMessage} />
		</div>
	);
}

export default ModelBox;
