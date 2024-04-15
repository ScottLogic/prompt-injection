import { env, exit } from 'node:process';

import { initDocumentVectors } from '@src/document';
import { getValidModelsFromOpenAI } from '@src/openai';

import app from './app';

// by default runs on port 3000
const port = env.PORT ?? String(3000);

app.listen(port, () => {
	// Set API key from environment variable
	console.debug('Fetching valid OpenAI models for API key...');

	const modelsPromise = getValidModelsFromOpenAI()
		.then(() => {
			console.debug('OpenAI models fetched');
		})
		.catch((err: unknown) => {
			console.error(err);
			throw new Error('Error fetching OpenAI models');
		});

	// initialise the documents on app startup
	const vectorsPromise = initDocumentVectors()
		.then(() => {
			console.debug('Document vector store initialized');
		})
		.catch((err: unknown) => {
			console.error(err);
			throw new Error('Error initializing document vectors');
		});

	Promise.all([modelsPromise, vectorsPromise])
		.then(() => {
			console.log(`Server is running on port ${port}`);
		})
		.catch((err: unknown) => {
			console.error(err);
			exit(1);
		});
});
