import { Express, Request } from 'express';

declare module 'node:net' {
	interface Socket {
		encrypted?: boolean;
	}
}
/**
 * Unfortunately, "trust proxy" is by default broken when Express is behind an
 * AWS HTTP API Gateway:
 * - https://github.com/expressjs/express/issues/5459
 * - https://repost.aws/en/questions/QUtBHMaz7IQ6aM4RCBMnJvgw/why-does-apigw-http-api-use-forwarded-header-while-other-services-still-use-x-forwarded-headers
 *
 * Therefore we use Express API overrides to modify our Request IP and Protocol properties:
 * - https://expressjs.com/en/guide/overriding-express-api.html
 */
export function usingForwardedHeader(app: Express): Express {
	Object.defineProperties(app.request, {
		ip: {
			configurable: true,
			enumerable: true,
			get() {
				const proxies = parseForwardedHeader(this as Request);
				return proxies?.for ?? (this as Request).socket.remoteAddress;
			},
		},
		protocol: {
			configurable: true,
			enumerable: true,
			get() {
				const proxies = parseForwardedHeader(this as Request);
				return proxies?.proto ?? (this as Request).socket.encrypted
					? 'https'
					: 'http';
			},
		},
	});
	return app;
}

/**
 * Forwarded header looks like this:
 *
 * ```
 * for=12.345.67.89;proto=https;host=somehost.org,for=98.76.54.321;proto=http;host=someproxy.net
 * ```
 *
 * Note we only need the first entry, as that is the client.
 *
 * @param request incoming express Request object
 */
function parseForwardedHeader(request: Request) {
	return request
		.header('Forwarded')
		?.split(',')
		.at(0)
		?.split(';')
		.reduce((result, proxyProps) => {
			const [key, value] = proxyProps.split('=');
			if (key && value) {
				result[key] = value;
			}
			return result;
		}, {} as Record<string, string>);
}
