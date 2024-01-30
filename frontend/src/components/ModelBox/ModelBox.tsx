import ModelConfiguration from './ModelConfiguration';
import ModelSelection from './ModelSelection';

import './ModelBox.css';

function ModelBox({
	chatModelOptions,
	addInfoMessage,
}: {
	chatModelOptions: string[];
	addInfoMessage: (message: string) => void;
}) {
	return (
		<div className="model-box">
			<ModelSelection
				chatModelOptions={chatModelOptions}
				addInfoMessage={addInfoMessage}
			/>
			<ModelConfiguration />
		</div>
	);
}

export default ModelBox;
