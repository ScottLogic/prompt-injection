import { DocViewerProps } from '@cyntler/react-doc-viewer/dist/esm/DocViewer';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	test,
	vi,
} from 'vitest';

import DocumentViewBox from './DocumentViewBox';

interface MockDocument {
	fileName: string;
	fileType: string;
	folder: string;
	content: string;
}

describe('DocumentViewBox component tests', () => {
	const URI = 'http://localhost:1234/';
	const defaultDocuments: MockDocument[] = [
		{
			fileName: 'document-1.txt',
			fileType: 'text/plain',
			folder: 'common',
			content: 'Now displaying document 1',
		},
		{
			fileName: 'document-2.txt',
			fileType: 'text/plain',
			folder: 'common',
			content: 'Now displaying document 2',
		},
		{
			fileName: 'document-3.txt',
			fileType: 'text/plain',
			folder: 'common',
			content: 'Now displaying document 3',
		},
	];

	const mockCloseOverlay = vi.fn();
	const mockGlobalFetch = vi.fn();

	const { mockGetDocumentMetas } = vi.hoisted(() => ({
		mockGetDocumentMetas: vi.fn(),
	}));
	vi.mock('@src/service/documentService', () => ({
		getDocumentMetas: mockGetDocumentMetas,
	}));

	const mockDocumentViewer = vi.hoisted(() => vi.fn());
	vi.mock('@cyntler/react-doc-viewer', () => ({
		default: (props: DocViewerProps) => {
			mockDocumentViewer(props);
			return <div>DocumentViewer</div>;
		},
		TXTRenderer: vi.fn(),
		CSVRenderer: vi.fn(),
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

	function getMockedDocumentMetas(documents: MockDocument[]) {
		return documents.map(({ fileName, fileType, folder }) => ({
			fileName,
			fileType,
			folder,
		}));
	}

	function setupMocks(documents: MockDocument[]) {
		mockGetDocumentMetas.mockResolvedValue(getMockedDocumentMetas(documents));
		mockGlobalFetch.mockImplementation(
			(uri: string, { method }: RequestInit) => {
				if (uri.startsWith(URI)) {
					const filename = uri.substring(uri.lastIndexOf('/') + 1);
					const document = documents.find((doc) => doc.fileName === filename);
					if (!document) {
						return Promise.reject(
							new Error('Unexpected error in test: document not found')
						);
					}
					const blob =
						!method || method === 'GET'
							? () => Promise.resolve(new Blob([document.content]))
							: undefined;
					return Promise.resolve({
						status: 200,
						ok: true,
						headers: {
							get: () => 'text/plain',
						} as Partial<Headers>,
						blob,
					} as Partial<Response>);
				}
				return Promise.reject(new Error('Not found'));
			}
		);
	}

	function renderDocumentViewBox() {
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

	describe('With three documents', () => {
		const documents = defaultDocuments;

		beforeEach(() => {
			setupMocks(documents);
		});

		test('WHEN close button clicked THEN closeOverlay called', async () => {
			const { user } = renderDocumentViewBox();

			const closeButton = screen.getByRole('button', {
				name: 'Close',
			});
			await user.click(closeButton);

			expect(mockCloseOverlay).toHaveBeenCalled();
		});

		test('WHEN the document viewer is rendered THEN document index, name, and number of documents are shown', async () => {
			renderDocumentViewBox();

			expect(
				await screen.findByText(documents[0].fileName)
			).toBeInTheDocument();
			expect(screen.getByText(`1 of ${documents.length}`)).toBeInTheDocument();
			expect(mockDocumentViewer).toHaveBeenCalledWith(
				expect.objectContaining({
					activeDocument: getMockedDocumentMetas(documents)[0],
					documents: getMockedDocumentMetas(documents),
				})
			);
		});

		test('WHEN the Next button is clicked THEN the next document is shown', async () => {
			const { user } = renderDocumentViewBox();
			// wait for header to load
			await screen.findByText(documents[0].fileName);

			await user.click(getNextButton());

			expect(
				await screen.findByText(documents[1].fileName)
			).toBeInTheDocument();
			expect(screen.getByText(`2 of ${documents.length}`)).toBeInTheDocument();
			expect(mockDocumentViewer).toHaveBeenCalledWith(
				expect.objectContaining({
					activeDocument: getMockedDocumentMetas(documents)[1],
					documents: getMockedDocumentMetas(documents),
				})
			);
		});

		test('WHEN the Previous button is clicked THEN the previous document is shown', async () => {
			const { user } = renderDocumentViewBox();
			// wait for header to load
			await screen.findByText(documents[0].fileName);

			await user.click(getNextButton());
			await user.click(getPreviousButton());

			expect(
				await screen.findByText(documents[0].fileName)
			).toBeInTheDocument();
			expect(screen.getByText(`1 of ${documents.length}`)).toBeInTheDocument();
			expect(mockDocumentViewer).toHaveBeenCalledWith(
				expect.objectContaining({
					activeDocument: getMockedDocumentMetas(documents)[0],
					documents: getMockedDocumentMetas(documents),
				})
			);
		});

		test('GIVEN the first document is shown THEN previous button is disabled', async () => {
			renderDocumentViewBox();
			// wait for header to load
			await screen.findByText(documents[0].fileName);

			const prevButton = getPreviousButton();
			expect(prevButton).toHaveAttribute('aria-disabled', 'true');
			expect(prevButton).toBeEnabled();

			const nextButton = getNextButton();
			expect(nextButton).toHaveAttribute('aria-disabled', 'false');
			expect(nextButton).toBeEnabled();
		});

		test('GIVEN a middle document is shown THEN both buttons are enabled', async () => {
			const { user } = renderDocumentViewBox();
			// wait for header to load
			await screen.findByText(documents[0].fileName);

			const prevButton = getPreviousButton();
			const nextButton = getNextButton();
			await user.click(nextButton);

			expect(prevButton).toHaveAttribute('aria-disabled', 'false');
			expect(prevButton).toBeEnabled();
			expect(nextButton).toHaveAttribute('aria-disabled', 'false');
			expect(nextButton).toBeEnabled();
		});
	});

	describe('With two documents', () => {
		const documents = defaultDocuments.slice(0, 2);

		beforeEach(() => {
			setupMocks(documents);
		});

		test('GIVEN the last document is shown THEN next button is disabled', async () => {
			const { user } = renderDocumentViewBox();
			// wait for header to load
			await screen.findByText(documents[0].fileName);

			const prevButton = getPreviousButton();
			const nextButton = getNextButton();
			await user.click(nextButton);

			expect(prevButton).toHaveAttribute('aria-disabled', 'false');
			expect(prevButton).toBeEnabled();
			expect(nextButton).toHaveAttribute('aria-disabled', 'true');
			expect(nextButton).toBeEnabled();
		});
	});

	describe('With one document', () => {
		const documents = defaultDocuments.slice(0, 1);

		beforeEach(() => {
			setupMocks(documents);
		});

		test("GIVEN there's only one document THEN both buttons are disabled", async () => {
			renderDocumentViewBox();
			// wait for header to load
			await screen.findByText(documents[0].fileName);

			const prevButton = getPreviousButton();
			expect(prevButton).toHaveAttribute('aria-disabled', 'true');
			expect(prevButton).toBeEnabled();

			const nextButton = getNextButton();
			expect(nextButton).toHaveAttribute('aria-disabled', 'true');
			expect(nextButton).toBeEnabled();
		});
	});

	describe('With zero documents', () => {
		const documents = [] as MockDocument[];

		beforeEach(() => {
			setupMocks(documents);
		});

		test('GIVEN there are zero documents THEN an error message is shown', async () => {
			const ExpectedErrorText =
				'Unable to fetch documents. Try opening the document viewer again. If the problem persists, please contact support.';
			renderDocumentViewBox();
			const messageElement = await screen.findByText(ExpectedErrorText);

			expect(messageElement).toBeInTheDocument();
		});
	});
});
