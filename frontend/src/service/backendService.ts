type RequestInterceptor = (request: RequestInit) => Promise<RequestInit>;

const interceptors = (() => {
	const registry: Record<string, RequestInterceptor> = {};

	function use(name: string, interceptor: RequestInterceptor) {
		registry[name] = interceptor;
	}

	async function applyAll(originalRequest: RequestInit) {
		return Object.values(registry).reduce(
			async (request, intercept) => {
				try {
					return intercept(await request);
				} catch (err: unknown) {
					console.warn('Could not apply request interceptor', err);
					return request;
				}
			},
			Promise.resolve(originalRequest)
		);
	}

	return {
		applyAll,
		use
	};
})();

function backendUrl(): string {
	const url = import.meta.env.VITE_BACKEND_URL;
	if (!url) throw new Error('VITE_BACKEND_URL env variable not set');

	return url.endsWith('/') ? url : `${url}/`;
}

type RequestOptions<T> = Pick<RequestInit, 'method' | 'signal'> & {
	body?: T;
};

async function get(path: string, options?: Omit<RequestOptions<never>, 'method' | 'body'>) {
	return sendRequest<never>(path, options);
}
async function post<T>(path: string, body?: T, options: Omit<RequestOptions<T>, 'method' | 'body'> = {}) {
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

	const requestInit = await interceptors.applyAll({
		method,
		body: body && JSON.stringify(body),
		signal,
		credentials: 'include',
		headers: {
			...contentType,
		},
	});

	return fetch(new URL(path, backendUrl()), requestInit);
}

const useInterceptor = interceptors.use;
export { backendUrl, get, post, useInterceptor  };
