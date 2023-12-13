import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	test,
	vi,
} from 'vitest';

import DocumentViewBox from './DocumentViewBox';

describe('DocumentViewBox component tests', () => {
	const mockCloseOverlay = vi.fn();
	const mockGlobalFetch = vi.fn();

	const { mockGetDocumentMetas } = vi.hoisted(() => {
		return { mockGetDocumentMetas: vi.fn() };
	});
	vi.mock('@src/service/documentService', () => ({
		getDocumentMetas: mockGetDocumentMetas,
	}));

	const realFetch = global.fetch;

	beforeAll(() => {
		global.fetch = mockGlobalFetch;
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	afterAll(() => {
		global.fetch = realFetch;
	});

	interface MockDocument {
		filename: string;
		content: string;
	}

	const defaultDocuments: MockDocument[] = [
		{
			filename: 'document-1.txt',
			content: 'Now displaying document 1',
		},
		{
			filename: 'document-2.txt',
			content: 'Now displaying document 2',
		},
		{
			filename: 'document-3.txt',
			content: 'Now displaying document 3',
		},
	];

	function renderDocumentViewBox(documents: MockDocument[] = defaultDocuments) {
		const URI = 'localhost:1234';

		// set up mocks
		mockGetDocumentMetas.mockResolvedValue(
			documents.map((doc) => ({
				filename: doc.filename,
				uri: `${URI}/${doc.filename}`,
			}))
		);
		mockGlobalFetch.mockImplementation((uri: string) => {
			if (uri.startsWith(URI)) {
				const filename = uri.split('/')[1];
				const document = documents.find((doc) => doc.filename === filename);
				console.log(`content=${document?.content}`);
				return Promise.resolve({
					headers: {
						get: () => 'text/plain',
					},
					blob: () => Promise.resolve(new Blob([document?.content ?? ''])),
				});
			}
			return Promise.reject(new Error('Not found'));
		});

		const user = userEvent.setup();
		render(<DocumentViewBox closeOverlay={mockCloseOverlay} />);
		return { user };
	}

	function getPreviousButton() {
		return screen.getByRole('button', { name: 'previous document' });
	}

	function getNextButton() {
		return screen.getByRole('button', { name: 'next document' });
	}

	test('WHEN close button clicked THEN closeOverlay called', async () => {
		const { user } = renderDocumentViewBox();

		const closeButton = screen.getByRole('button', {
			name: 'close document viewer',
		});
		await user.click(closeButton);

		expect(mockCloseOverlay).toHaveBeenCalled();
	});

	test('WHEN the document viewer is rendered THEN document index, name, and number of documents are shown', async () => {
		renderDocumentViewBox();

		expect(
			await screen.findByText(defaultDocuments[0].filename)
		).toBeInTheDocument();
		expect(
			screen.getByText(`1 out of ${defaultDocuments.length}`)
		).toBeInTheDocument();
		expect(
			await screen.findByText(defaultDocuments[0].content)
		).toBeInTheDocument();
	});

	test.only('WHEN the next button is clicked THEN the next document is shown', async () => {
		const { user } = renderDocumentViewBox();
		// wait for header to load
		await screen.findByText(defaultDocuments[0].filename);

		const nextButton = getNextButton();
		await user.click(nextButton);

		expect(
			await screen.findByText(defaultDocuments[1].filename)
		).toBeInTheDocument();
		expect(
			screen.getByText(`2 out of ${defaultDocuments.length}`)
		).toBeInTheDocument();
		expect(
			await screen.findByText(defaultDocuments[1].content)
		).toBeInTheDocument();
	});

	test.only('WHEN the previous button is clicked THEN the previous document is shown', async () => {
		const { user } = renderDocumentViewBox();
		// wait for header to load
		await screen.findByText(defaultDocuments[0].filename);

		const nextButton = getNextButton();
		await user.click(nextButton);

		const prevButton = getPreviousButton();
		await user.click(prevButton);

		expect(
			await screen.findByText(defaultDocuments[0].filename)
		).toBeInTheDocument();
		expect(
			screen.getByText(`1 out of ${defaultDocuments.length}`)
		).toBeInTheDocument();
		expect(
			await screen.findByText(defaultDocuments[0].content)
		).toBeInTheDocument();
	});

	test('GIVEN the first document is shown THEN previous button is disabled', async () => {
		renderDocumentViewBox();
		// wait for header to load
		await screen.findByText(defaultDocuments[0].filename);

		const prevButton = getPreviousButton();
		expect(prevButton).toHaveAttribute('aria-disabled', 'true');
		expect(prevButton).toBeEnabled();

		const nextButton = getNextButton();
		expect(nextButton).toHaveAttribute('aria-disabled', 'false');
		expect(nextButton).toBeEnabled();
	});

	test('GIVEN a middle document is shown THEN both buttons are not disabled', async () => {
		const { user } = renderDocumentViewBox(defaultDocuments);
		// wait for header to load
		await screen.findByText(defaultDocuments[0].filename);

		const prevButton = getPreviousButton();
		const nextButton = getNextButton();
		await user.click(nextButton);

		expect(prevButton).toHaveAttribute('aria-disabled', 'false');
		expect(prevButton).toBeEnabled();
		expect(nextButton).toHaveAttribute('aria-disabled', 'false');
		expect(nextButton).toBeEnabled();
	});

	test('GIVEN the last document is shown THEN next button is disabled', async () => {
		const documents: MockDocument[] = [
			{
				filename: 'document-1.txt',
				content: 'Now displaying document 1',
			},
			{
				filename: 'document-2.txt',
				content: 'Now displaying document 2',
			},
		];

		const { user } = renderDocumentViewBox(documents);
		// wait for header to load
		await screen.findByText(defaultDocuments[0].filename);

		const prevButton = getPreviousButton();
		const nextButton = getNextButton();
		await user.click(nextButton);

		expect(prevButton).toHaveAttribute('aria-disabled', 'false');
		expect(prevButton).toBeEnabled();
		expect(nextButton).toHaveAttribute('aria-disabled', 'true');
		expect(nextButton).toBeEnabled();
	});

	test("GIVEN there's only one document THEN both buttons are disabled", async () => {
		const document: MockDocument = {
			filename: 'document-1.txt',
			content: 'Now displaying document 1',
		};
		renderDocumentViewBox([document]);
		// wait for header to load
		await screen.findByText(document.filename);

		const prevButton = getPreviousButton();
		expect(prevButton).toHaveAttribute('aria-disabled', 'true');
		expect(prevButton).toBeEnabled();

		const nextButton = getNextButton();
		expect(nextButton).toHaveAttribute('aria-disabled', 'true');
		expect(nextButton).toBeEnabled();
	});
});
