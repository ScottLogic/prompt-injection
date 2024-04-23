import { test, jest, expect, beforeAll, afterEach } from '@jest/globals';
import { Document } from 'langchain/document';

import { initDocumentVectors } from '@src/document';

const mockLoader =
	jest.fn<() => Promise<Document<Record<string, unknown>>[]>>();
const mockSplitDocuments = jest.fn<() => Promise<unknown>>();

// mock DirectoryLoader
jest.mock('langchain/document_loaders/fs/directory', () => {
	return {
		DirectoryLoader: jest.fn().mockImplementation(() => {
			return {
				load: mockLoader,
			};
		}),
		UnknownHandling: {
			Warn: 'warn',
		},
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

beforeAll(() => {
	mockLoader.mockResolvedValue([]);
	mockSplitDocuments.mockResolvedValue([]);
});

afterEach(() => {
	mockLoader.mockClear();
	mockSplitDocuments.mockClear();
});

test('GIVEN application WHEN application starts THEN document vectors are loaded for all levels', async () => {
	await initDocumentVectors();

	const numberOfCalls = 4 + 1; // number of levels + common
	expect(mockLoader).toHaveBeenCalledTimes(numberOfCalls);
	expect(mockSplitDocuments).toHaveBeenCalledTimes(numberOfCalls);
});
