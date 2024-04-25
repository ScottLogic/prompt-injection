//import type { DocViewerProps } from '@cyntler/react-doc-viewer/dist/esm/DocViewer';
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

import { backendUrl, get } from '@src/service/backendService';

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

	vi.mock('@src/service/backendService');

	const mockCloseOverlay = vi.fn();
	//const mockDocumentViewer = vi.hoisted(() => vi.fn());

	/*vi.mock('@cyntler/react-doc-viewer', () => ({
		default: (props: DocViewerProps) => {
			mockDocumentViewer(props);
			return <div>DocumentViewer</div>;
		},
		CSVRenderer: {},
		TXTRenderer: {},
	}));*/

	beforeAll(() => {
		vi.mocked(backendUrl).mockReturnValue(URI);
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	function generateDocumentMetas(documents: MockDocument[]) {
		return documents.map(({ fileName, fileType, folder }) => ({
			fileName,
			fileType,
			folder,
		}));
	}

	function setupMocks(documents: MockDocument[]) {
		vi.mocked(get).mockImplementation((path) => {
			if (path === 'documents/') {
				return Promise.resolve({
					json: () => Promise.resolve(generateDocumentMetas(documents)),
				} as Response);
			}
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

	function renderDocumentViewBox() {
		const user = userEvent.setup();
		render(<DocumentViewBox closeOverlay={mockCloseOverlay} />);
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
			const { user } = renderDocumentViewBox();

			await user.click(closeButton());

			expect(mockCloseOverlay).toHaveBeenCalled();
		});

		test('WHEN the document viewer is rendered THEN document name, content, and number of documents are visible', async () => {
			renderDocumentViewBox();

			expect(
				await screen.findByText(documents[0].fileName)
			).toBeInTheDocument();
			expect(screen.getByText(`1 of ${documents.length}`)).toBeInTheDocument();
			expect(await screen.findByText(documents[0].content)).toBeInTheDocument();
		});

		test('WHEN the Next button is clicked THEN the next document is shown', async () => {
			const { user } = renderDocumentViewBox();
			// wait for header to load
			await screen.findByText(documents[0].fileName);

			await user.click(nextDocumentButton());

			expect(
				await screen.findByText(documents[1].fileName)
			).toBeInTheDocument();
			expect(screen.getByText(`2 of ${documents.length}`)).toBeInTheDocument();
			expect(await screen.findByText(documents[1].content)).toBeInTheDocument();
		});

		test('WHEN the Previous button is clicked THEN the previous document is shown', async () => {
			const { user } = renderDocumentViewBox();
			// wait for header to load
			await screen.findByText(documents[0].fileName);

			await user.click(nextDocumentButton());
			await user.click(previousDocumentButton());

			expect(
				await screen.findByText(documents[0].fileName)
			).toBeInTheDocument();
			expect(screen.getByText(`1 of ${documents.length}`)).toBeInTheDocument();
			expect(await screen.findByText(documents[0].content)).toBeInTheDocument();
		});

		test('GIVEN the first document is shown THEN previous button is disabled', async () => {
			renderDocumentViewBox();
			// wait for header to load
			await screen.findByText(documents[0].fileName);

			const prevButton = previousDocumentButton();
			expect(prevButton).toBeEnabled();
			expect(prevButton).toHaveAttribute('aria-disabled', 'true');

			const nextButton = nextDocumentButton();
			expect(nextButton).toBeEnabled();
			expect(nextButton).toHaveAttribute('aria-disabled', 'false');
		});

		test('GIVEN a middle document is shown THEN both buttons are enabled', async () => {
			const { user } = renderDocumentViewBox();
			// wait for header to load
			await screen.findByText(documents[0].fileName);

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

		test('GIVEN the second document is shown THEN next button is disabled', async () => {
			const { user } = renderDocumentViewBox();
			// wait for header to load
			await screen.findByText(documents[0].fileName);

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

		test('GIVEN the document is visible THEN both buttons are disabled', async () => {
			renderDocumentViewBox();
			// wait for header to load
			await screen.findByText(documents[0].fileName);

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

		test('GIVEN the component has loaded THEN an error message is shown', async () => {
			const ExpectedErrorText =
				'Unable to fetch documents. Try opening the document viewer again. If the problem persists, please contact support.';
			renderDocumentViewBox();
			const messageElement = await screen.findByText(ExpectedErrorText);

			expect(messageElement).toBeInTheDocument();
		});
	});
});
