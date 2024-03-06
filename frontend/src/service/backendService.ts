import { fetchAuthSession } from '@aws-amplify/auth';

function getBackendUrl(): string {
	const url = import.meta.env.VITE_BACKEND_URL;
	if (!url) throw new Error('VITE_BACKEND_URL env variable not set');
	return url;
}

function makeUrl(path: string): URL {
	return new URL(path, getBackendUrl());
}

type RequestOptions<T> = Pick<RequestInit, 'method' | 'signal'> & {
	body?: T;
};

async function sendRequest<T>(path: string, options: RequestOptions<T> = {}) {
	const { method = 'GET', body, signal } = options;
	// No auth in dev mode
	const auth: Record<string, string> =
		import.meta.env.MODE === 'production'
			? {
					Authorization:
						(await fetchAuthSession()).tokens?.accessToken.toString() ?? '',
			  }
			: {};

	// Body is always JSON, if present
	const contentType: Record<string, string> = body
		? {
				'Content-Type': 'application/json',
		  }
		: {};

	return fetch(makeUrl(path), {
		method,
		body: body && JSON.stringify(body),
		signal,
		credentials: 'include',
		headers: {
			...auth,
			...contentType,
		},
	});
}

export { getBackendUrl, sendRequest };
