function getBackendUrl(): string {
	const url = import.meta.env.VITE_BACKEND_URL;
	if (!url) throw new Error('VITE_BACKEND_URL env variable not set');
	return url;
}

function makeUrl(path: string): URL {
	return new URL(path, getBackendUrl());
}

async function sendRequest(path: string, options: RequestInit) {
	return fetch(makeUrl(path), { ...options, credentials: 'same-origin' });
}

export { getBackendUrl, sendRequest };
