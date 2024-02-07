import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import OverlayHeader from './OverlayHeader';

const mockCloseOverlay = vi.fn();

describe('Overlay Header component', () => {
    test('renders the heading text passed in', () => {
        render(<OverlayHeader heading="Test Header" closeOverlay={mockCloseOverlay}/>)
        
        expect(screen.getByText('Test Header')).toBeInTheDocument();
    })

    test('renders close button', () => {
        render(<OverlayHeader heading="Test Header" closeOverlay={mockCloseOverlay}/>)
        
        expect(screen.getByText('close')).toBeInTheDocument();
    })
})