import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import OverlayHeader from './OverlayHeader';

const mockCloseOverlay = vi.fn();

describe('Overlay Header component', () => {
	test('renders the heading text passed in', () => {
		render(
			<OverlayHeader heading="Test Header" closeOverlay={mockCloseOverlay} />
		);

		expect(screen.getByText('Test Header')).toBeInTheDocument();
	});

	test('renders close button', () => {
		render(
			<OverlayHeader heading="Test Header" closeOverlay={mockCloseOverlay} />
		);

		expect(screen.getByText('close')).toBeInTheDocument();
	});

	test('clicking the close button closes the modal', async () => {
		render(
			<OverlayHeader heading="Test Header" closeOverlay={mockCloseOverlay} />
		);
		await userEvent.click(screen.getByRole('button'));

		expect(mockCloseOverlay).toHaveBeenCalledOnce();
	});
});
