import { ReactNode } from 'react';

import OverlayHeader from './OverlayHeader';
import OverlayNav from './OverlayNav';

import './Overlay.css';

function Overlay({
	children,
	closeOverlay,
	heading,
}: {
	children: ReactNode;
	closeOverlay: () => void;
	heading: string;
}) {
	return (
		<div className="overlay">
			<OverlayHeader closeOverlay={closeOverlay} heading={heading} />
			<div className="overlay-content">{children}</div>
			<OverlayNav />
		</div>
	);
}

export default Overlay;
