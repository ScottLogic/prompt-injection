import ModelConfiguration from './ModelConfiguration';
import ModelSelection from './ModelSelection';

import './ModelBox.css';

function ModelBox({ chatModelOptions }: { chatModelOptions: string[] }) {
	return (
		<div className="model-box">
			<ModelSelection chatModelOptions={chatModelOptions} />
			<ModelConfiguration />
		</div>
	);
}

export default ModelBox;
