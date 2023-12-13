function getBackendUrl(): string {
	const url = import.meta.env.VITE_BACKEND_URL;
	if (!url) throw new Error('VITE_BACKEND_URL env variable not set');
	return url;
}

function makeUrl(path: string): URL {
	return new URL(path, getBackendUrl());
}

async function sendRequestOld(
	path: string,
	method: string,
	headers?: HeadersInit,
	body?: BodyInit,
	signal?: AbortSignal,
): Promise<Response> {
	const init: RequestInit = {
		credentials: 'include',
		method,
		signal,
	};
	if (headers) {
		init.headers = headers;
	}
	if (body) {
		init.body = body;
	}
	return fetch(makeUrl(path), init);
}

async function sendRequest(path: string, options: RequestInit) {
	return fetch(makeUrl(path), { ...options, credentials: 'include' });
}

export { getBackendUrl, sendRequestOld, sendRequest };
