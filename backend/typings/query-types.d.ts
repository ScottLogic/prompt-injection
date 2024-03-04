declare module 'query-types' {
	import { NextHandleFunction } from 'connect';

	function middleware(): NextHandleFunction;
}