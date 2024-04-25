/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_BACKEND_URL: string;
	readonly VITE_AUTH_PROVIDER: string;
	readonly VITE_COGNITO_USERPOOL_ID: string;
	readonly VITE_COGNITO_USERPOOL_CLIENT: string;
	readonly VITE_COGNITO_USERPOOL_DOMAIN: string;
	readonly VITE_COGNITO_USERPOOL_ENDPOINT: string;
	readonly VITE_COGNITO_REDIRECT_URL: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
