/*
  Wrap access to import.meta in own module, so can be mocked for tests.
  ts-jest is not playing nicely :(
  e.g. https://stackoverflow.com/q/64961387
*/

export function importMetaUrl() {
	return import.meta.url;
}
