import { ReactNode } from 'react';

import OverlayHeader from './OverlayHeader';

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
		</div>
	);
}

export default Overlay;
