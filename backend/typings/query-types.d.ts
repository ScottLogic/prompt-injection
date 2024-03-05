declare module 'query-types' {
	import type { NextHandleFunction } from 'connect';

	function middleware(): NextHandleFunction;
}
