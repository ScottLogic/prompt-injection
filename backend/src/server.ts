import { env, exit } from 'node:process';

import app from './app';
import { initDocumentVectors } from './document';
import { getValidModelsFromOpenAI } from './openai';
// by default runs on port 3001
const port = env.PORT ?? String(3001);

app.listen(port, () => {
	// Set API key from environment variable
	console.debug('Fetching valid OpenAI models for API key...');

	const modelsPromise = getValidModelsFromOpenAI()
		.then(() => {
			console.debug('OpenAI models fetched');
		})
		.catch((err) => {
			throw new Error(`Error fetching OpenAI models: ${err}`);
		});

	// initialise the documents on app startup
	const vectorsPromise = initDocumentVectors()
		.then(() => {
			console.debug('Document vector store initialized');
		})
		.catch((err) => {
			throw new Error(`Error initializing document vectors: ${err}`);
		});

	Promise.all([modelsPromise, vectorsPromise])
		.then(() => {
			console.log(`Server is running on port ${port}`);
		})
		.catch((err) => {
			console.error(err);
			exit(1);
		});
});
