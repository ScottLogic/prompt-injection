import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from '@src/components/App';
import { CognitoAuthenticatedApp } from '@src/components/AuthProviders';

import './index.css';

function resolveAppComponent(mode: string, authProvider?: ImportMetaEnv['VITE_AUTH_PROVIDER']) {
	if (mode !== 'development') {
		if (authProvider === 'cognito') return CognitoAuthenticatedApp;
	}
	return App;
}

function main() {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const root = createRoot(document.getElementById('root')!);
	const AppComponent = resolveAppComponent(import.meta.env.MODE, import.meta.env.VITE_AUTH_PROVIDER);

	root.render(
		<StrictMode>
			<AppComponent />
		</StrictMode>
	);
}

main();
