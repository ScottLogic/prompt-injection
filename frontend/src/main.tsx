import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from '@src/components/App';
import { CognitoAuthenticatedApp } from '@src/components/AuthProviders';

import './styles/index.css';

function resolveAppComponent(
	mode: string,
	authProvider?: ImportMetaEnv['VITE_AUTH_PROVIDER']
) {
	if (mode === 'development') {
		console.log('Development mode, authentication disabled');
		return App;
	}
	if (authProvider === 'cognito') {
		console.log('Using Cognito authentication');
		return CognitoAuthenticatedApp;
	}

	console.warn(
		'Running without authentication!',
		authProvider
			? `Provider "${authProvider}" is not mapped to an App component`
			: `VITE_AUTH_PROVIDER not defined in ${mode} environment`
	);
	return App;
}

function main() {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const root = createRoot(document.getElementById('root')!);
	const AppComponent = resolveAppComponent(
		import.meta.env.MODE,
		import.meta.env.VITE_AUTH_PROVIDER
	);

	root.render(
		<StrictMode>
			<AppComponent />
		</StrictMode>
	);
}

main();
