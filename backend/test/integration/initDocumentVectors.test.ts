// this file tests across langchain and document.ts

import { test, jest, expect } from '@jest/globals';

import { initDocumentVectors } from '@src/document';

const mockLoader = jest.fn();
const mockSplitDocuments = jest.fn<() => Promise<unknown>>();

// mock DirectoryLoader
jest.mock('langchain/document_loaders/fs/directory', () => {
	return {
		DirectoryLoader: jest.fn().mockImplementation(() => {
			return {
				load: mockLoader,
			};
		}),
	};
});

// mock RecursiveCharacterTextSplitter
jest.mock('langchain/text_splitter', () => {
	return {
		RecursiveCharacterTextSplitter: jest.fn().mockImplementation(() => {
			return {
				splitDocuments: mockSplitDocuments,
			};
		}),
	};
});

test('GIVEN application WHEN application starts THEN document vectors are loaded for all levels', async () => {
	const numberOfCalls = 4 + 1; // number of levels + common

	mockSplitDocuments.mockResolvedValue([]);

	await initDocumentVectors();
	expect(mockLoader).toHaveBeenCalledTimes(numberOfCalls);
	expect(mockSplitDocuments).toHaveBeenCalledTimes(numberOfCalls);
});
