function backendUrl(): string {
	const url = import.meta.env.VITE_BACKEND_URL;
	if (!url) throw new Error('VITE_BACKEND_URL env variable not set');

	return url.endsWith('/') ? url : `${url}/`;
}

function makeUrl(path: string): URL {
	return new URL(path, backendUrl());
}

type RequestOptions<T> = Pick<RequestInit, 'method' | 'signal'> & {
	body?: T;
};

async function get(
	path: string,
	options?: Omit<RequestOptions<never>, 'method' | 'body'>
) {
	return sendRequest<never>(path, options);
}
async function post<T>(
	path: string,
	body?: T,
	options: Omit<RequestOptions<T>, 'method' | 'body'> = {}
) {
	return sendRequest(path, { ...options, method: 'POST', body });
}

async function sendRequest<T>(path: string, options: RequestOptions<T> = {}) {
	const { method = 'GET', body, signal } = options;

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
			...contentType,
		},
	});
}

export { backendUrl, get, post };
