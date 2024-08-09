import { IDocument } from '@cyntler/react-doc-viewer';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	test,
	vi,
} from 'vitest';

import { DocumentMeta } from '@src/models/document';
import { backendUrl, get } from '@src/service/backendService';

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

	vi.mock('@src/service/backendService');

	const mockCloseOverlay = vi.fn();

	beforeAll(() => {
		vi.mocked(backendUrl).mockReturnValue(BASE_URL);
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	function setupMocks(documents: MockDocument[]) {
		vi.mocked(get).mockImplementation((path) => {
			const fileName = path.substring(path.lastIndexOf('/') + 1);
			const document = documents.find((doc) => doc.fileName === fileName);
			if (!document) {
				return Promise.reject(
					new Error('Unexpected error in test: document not found')
				);
			}
			return Promise.resolve({
				blob: () => Promise.resolve(new Blob([document.content])),
			} as Response);
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

	function previousDocumentButton() {
		return screen.getByRole('button', { name: 'previous document' });
	}

	function nextDocumentButton() {
		return screen.getByRole('button', { name: 'next document' });
	}

	function closeButton() {
		return screen.getByRole('button', { name: 'Close' });
	}

	describe('With three documents', () => {
		const documents = defaultDocuments;

		beforeEach(() => {
			setupMocks(documents);
		});

		test('WHEN close button clicked THEN closeOverlay called', async () => {
			const { user } = renderDocumentViewBox(documents);

			await user.click(closeButton());

			expect(mockCloseOverlay).toHaveBeenCalled();
		});

		test('WHEN the document viewer is rendered THEN document name, content, and number of documents are visible', async () => {
			renderDocumentViewBox(documents);

			expect(screen.getByText(documents[0].fileName)).toBeInTheDocument();
			expect(screen.getByText(`1 of ${documents.length}`)).toBeInTheDocument();
			expect(await screen.findByText(documents[0].content)).toBeInTheDocument();
		});

		test('WHEN the Next button is clicked THEN the next document is shown', async () => {
			const { user } = renderDocumentViewBox(documents);
			expect(await screen.findByText(documents[0].content)).toBeInTheDocument();

			await user.click(nextDocumentButton());

			expect(
				await screen.findByText(documents[1].fileName)
			).toBeInTheDocument();
			expect(screen.getByText(`2 of ${documents.length}`)).toBeInTheDocument();
			expect(await screen.findByText(documents[1].content)).toBeInTheDocument();
		});

		test('WHEN the Previous button is clicked THEN the previous document is shown', async () => {
			const { user } = renderDocumentViewBox(documents);
			expect(await screen.findByText(documents[0].content)).toBeInTheDocument();

			// Currently, DocumentViewBox always opens on first doc, so this test
			// must use same setup as the above test, to first load the second doc.
			await user.click(nextDocumentButton());
			expect(await screen.findByText(documents[1].content)).toBeInTheDocument();

			await user.click(previousDocumentButton());

			expect(
				await screen.findByText(documents[0].fileName)
			).toBeInTheDocument();
			expect(screen.getByText(`1 of ${documents.length}`)).toBeInTheDocument();
			expect(await screen.findByText(documents[0].content)).toBeInTheDocument();
		});

		test('WHEN the first document is shown THEN previous button is disabled', () => {
			renderDocumentViewBox(documents);

			const prevButton = previousDocumentButton();
			expect(prevButton).toBeEnabled();
			expect(prevButton).toHaveAttribute('aria-disabled', 'true');

			const nextButton = nextDocumentButton();
			expect(nextButton).toBeEnabled();
			expect(nextButton).toHaveAttribute('aria-disabled', 'false');
		});

		test('WHEN a document that is not first or last is shown THEN both buttons are enabled', async () => {
			const { user } = renderDocumentViewBox(documents);

			const prevButton = previousDocumentButton();
			const nextButton = nextDocumentButton();
			await user.click(nextButton);

			expect(prevButton).toBeEnabled();
			expect(prevButton).toHaveAttribute('aria-disabled', 'false');
			expect(nextButton).toBeEnabled();
			expect(nextButton).toHaveAttribute('aria-disabled', 'false');
		});
	});

	describe('With two documents', () => {
		const documents = defaultDocuments.slice(0, 2);

		beforeEach(() => {
			setupMocks(documents);
		});

		test('GIVEN the last document is shown THEN next button is disabled', async () => {
			const { user } = renderDocumentViewBox(documents);

			const prevButton = previousDocumentButton();
			const nextButton = nextDocumentButton();
			await user.click(nextButton);

			expect(prevButton).toBeEnabled();
			expect(prevButton).toHaveAttribute('aria-disabled', 'false');
			expect(nextButton).toBeEnabled();
			expect(nextButton).toHaveAttribute('aria-disabled', 'true');
		});
	});

	describe('With one document', () => {
		const documents = defaultDocuments.slice(0, 1);

		beforeEach(() => {
			setupMocks(documents);
		});

		test('WHEN the document has loaded THEN both buttons are disabled', () => {
			renderDocumentViewBox(documents);

			const prevButton = previousDocumentButton();
			expect(prevButton).toBeEnabled();
			expect(prevButton).toHaveAttribute('aria-disabled', 'true');

			const nextButton = nextDocumentButton();
			expect(nextButton).toBeEnabled();
			expect(nextButton).toHaveAttribute('aria-disabled', 'true');
		});
	});

	describe('With zero documents', () => {
		const documents = [] as MockDocument[];

		beforeEach(() => {
			setupMocks(documents);
		});

		test('WHEN the component has loaded THEN an error message is shown', () => {
			const ExpectedErrorText =
				'Unable to fetch documents. Try opening the document viewer again. If the problem persists, please contact support.';
			renderDocumentViewBox(documents);

			expect(screen.getByText(ExpectedErrorText)).toBeInTheDocument();
		});
	});

	describe('With document metas in flight', () => {
		test('GIVEN document metadata have not yet arrived WHEN component renders THEN a loading indicator is shown', () => {
			renderDocumentViewBox();
			expect(screen.getByRole('progressbar')).toBeInTheDocument();
		});
	});
});
