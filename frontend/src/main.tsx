import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import AuthenticatedApp from './AuthenticatedApp';

import './index.css';

function main() {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const root = createRoot(document.getElementById('root')!);
	root.render(
		<StrictMode>
			{import.meta.env.MODE === 'development' ? <App /> : <AuthenticatedApp />}
		</StrictMode>
	);
}

main();
