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
	filename: string;
	content: string;
}

describe('DocumentViewBox component tests', () => {
	const URI = 'localhost:1234';
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
		DocViewerRenderers: vi.fn(),
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
		mockGetDocumentMetas.mockResolvedValue(
			documents.map((doc) => ({
				filename: doc.filename,
				uri: `${URI}/${doc.filename}`,
			}))
		);
		mockGlobalFetch.mockImplementation(
			(uri: string, { method }: RequestInit) => {
				if (uri.startsWith(URI)) {
					const filename = uri.split('/')[1];
					const document = documents.find((doc) => doc.filename === filename);
					const blob =
						!method || method === 'GET'
							? () => Promise.resolve(new Blob([document?.content ?? '']))
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
				name: 'close document viewer',
			});
			await user.click(closeButton);

			expect(mockCloseOverlay).toHaveBeenCalled();
		});

		test('WHEN the document viewer is rendered THEN document index, name, and number of documents are shown', async () => {
			renderDocumentViewBox();

			expect(
				await screen.findByText(documents[0].filename)
			).toBeInTheDocument();
			expect(
				screen.getByText(`1 out of ${documents.length}`)
			).toBeInTheDocument();
			expect(await screen.findByText(documents[0].content)).toBeInTheDocument();
		});

		test('WHEN the next button is clicked THEN the next document is shown', async () => {
			const { user } = renderDocumentViewBox();
			// wait for header to load
			await screen.findByText(documents[0].filename);

			await user.click(getNextButton());

			expect(
				await screen.findByText(documents[1].filename)
			).toBeInTheDocument();
			expect(
				screen.getByText(`2 out of ${documents.length}`)
			).toBeInTheDocument();
			/* This is sporadically, non_deterministically failing! See #658 for details
			expect(
				await screen.findByText(documents[1].content)
			).toBeInTheDocument();*/
		});

		test('WHEN the previous button is clicked THEN the previous document is shown', async () => {
			const { user } = renderDocumentViewBox();
			// wait for header to load
			await screen.findByText(documents[0].filename);

			await user.click(getNextButton());
			await user.click(getPreviousButton());

			expect(
				await screen.findByText(documents[0].filename)
			).toBeInTheDocument();
			expect(
				screen.getByText(`1 out of ${documents.length}`)
			).toBeInTheDocument();
			/* This is sporadically, non_deterministically failing! See #658 for details
			expect(
				await screen.findByText(documents[0].content)
			).toBeInTheDocument()*/
		});

		test('GIVEN the first document is shown THEN previous button is disabled', async () => {
			renderDocumentViewBox();
			// wait for header to load
			await screen.findByText(documents[0].filename);

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
			await screen.findByText(documents[0].filename);

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
			await screen.findByText(documents[0].filename);

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
			await screen.findByText(documents[0].filename);

			const prevButton = getPreviousButton();
			expect(prevButton).toHaveAttribute('aria-disabled', 'true');
			expect(prevButton).toBeEnabled();

			const nextButton = getNextButton();
			expect(nextButton).toHaveAttribute('aria-disabled', 'true');
			expect(nextButton).toBeEnabled();
		});
	});
});
