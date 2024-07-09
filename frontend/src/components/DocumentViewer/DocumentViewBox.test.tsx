import { IDocument } from '@cyntler/react-doc-viewer';
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

import { DocumentMeta } from '@src/models/document';

import DocumentViewBox from './DocumentViewBox';

type MockDocument = Pick<DocumentMeta, 'fileName' | 'fileType'> &
	Pick<IDocument, 'uri'> & {
		content: string;
	};

describe('DocumentViewBox component tests', () => {
	const BASE_URL = 'http://localhost:1234/documents';
	const defaultDocuments: MockDocument[] = [
		{
			fileName: 'document-1.txt',
			fileType: 'text/plain',
			uri: `${BASE_URL}/common/document-1.txt`,
			content: 'This is common document 1',
		},
		{
			fileName: 'document-2.txt',
			fileType: 'text/plain',
			uri: `${BASE_URL}/common/document-2.txt`,
			content: 'This is common document 2',
		},
		{
			fileName: 'document-3.txt',
			fileType: 'text/plain',
			uri: `${BASE_URL}/sandbox/document-3.txt`,
			content: 'This is sandbox document 3',
		},
	];

	const mockCloseOverlay = vi.fn();
	const mockGlobalFetch = vi.fn();

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

	function setupMocks(documents: MockDocument[]) {
		mockGlobalFetch.mockImplementation((uri: string) => {
			if (uri.startsWith(BASE_URL)) {
				const filename = uri.substring(uri.lastIndexOf('/') + 1);
				const document = documents.find((doc) => doc.fileName === filename);
				if (!document) {
					return Promise.reject(
						new Error('Unexpected error in test: document not found')
					);
				}
				return Promise.resolve({
					status: 200,
					ok: true,
					headers: {
						get: () => document.fileType,
					} as Partial<Headers>,
					blob: () => Promise.resolve(new Blob([document.content])),
				} as Partial<Response>);
			}
			return Promise.reject(new Error('Not found'));
		});
	}

	function renderDocumentViewBox(documents?: MockDocument[]) {
		const user = userEvent.setup();
		render(
			<DocumentViewBox documents={documents} closeOverlay={mockCloseOverlay} />
		);

		if (documents?.length) {
			// verify header has loaded
			screen.getByText(documents[0].fileName);
		}

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
			const { user } = renderDocumentViewBox(documents);

			const closeButton = screen.getByRole('button', {
				name: 'Close',
			});
			await user.click(closeButton);

			expect(mockCloseOverlay).toHaveBeenCalled();
		});

		test('WHEN the document viewer is rendered THEN document index, name, and number of documents are shown', () => {
			renderDocumentViewBox(documents);

			expect(screen.getByText(documents[0].fileName)).toBeInTheDocument();
			expect(screen.getByText(`1 of ${documents.length}`)).toBeInTheDocument();
			expect(mockDocumentViewer).toHaveBeenCalledWith(
				expect.objectContaining({
					activeDocument: documents[0],
					documents,
				})
			);
		});

		test('WHEN the Next button is clicked THEN the next document is shown', async () => {
			const { user } = renderDocumentViewBox(documents);

			await user.click(getNextButton());

			expect(
				await screen.findByText(documents[1].fileName)
			).toBeInTheDocument();
			expect(screen.getByText(`2 of ${documents.length}`)).toBeInTheDocument();
			expect(mockDocumentViewer).toHaveBeenCalledWith(
				expect.objectContaining({
					activeDocument: documents[1],
					documents,
				})
			);
		});

		test('WHEN the Previous button is clicked THEN the previous document is shown', async () => {
			const { user } = renderDocumentViewBox(documents);

			await user.click(getNextButton());
			await user.click(getPreviousButton());

			expect(
				await screen.findByText(documents[0].fileName)
			).toBeInTheDocument();
			expect(screen.getByText(`1 of ${documents.length}`)).toBeInTheDocument();
			expect(mockDocumentViewer).toHaveBeenCalledWith(
				expect.objectContaining({
					activeDocument: documents[0],
					documents,
				})
			);
		});

		test('WHEN the first document is shown THEN previous button is disabled', () => {
			renderDocumentViewBox(documents);

			const prevButton = getPreviousButton();
			expect(prevButton).toHaveAttribute('aria-disabled', 'true');
			expect(prevButton).toBeEnabled();

			const nextButton = getNextButton();
			expect(nextButton).toHaveAttribute('aria-disabled', 'false');
			expect(nextButton).toBeEnabled();
		});

		test('WHEN a document that is not first or last is shown THEN both buttons are enabled', async () => {
			const { user } = renderDocumentViewBox(documents);

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
			const { user } = renderDocumentViewBox(documents);

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

		test("GIVEN there's only one document THEN both buttons are disabled", () => {
			renderDocumentViewBox(documents);

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

		test('GIVEN there are zero documents WHEN component renders THEN an error message is shown', () => {
			const ExpectedErrorText =
				'Unable to fetch documents. Try opening the document viewer again. If the problem persists, please contact support.';
			renderDocumentViewBox(documents);
			const messageElement = screen.getByText(ExpectedErrorText);

			expect(messageElement).toBeInTheDocument();
		});
	});

	describe('With document metas in flight', () => {
		test('GIVEN document metadata have not yet arrived WHEN component renders THEN a loading indicator is shown', () => {
			renderDocumentViewBox();
			expect(screen.getByRole('progressbar')).toBeInTheDocument();
		});
	});
});
