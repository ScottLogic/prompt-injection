import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

/*
 Unfortunately, Jest does not yet support "import.meta" syntax of ES Modules.
 Can fake it for our tests:
 */
export function importMetaUrl() {
	return pathToFileURL(join(process.cwd(), 'src'));
}
