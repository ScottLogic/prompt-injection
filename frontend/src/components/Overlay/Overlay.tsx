import { ReactNode } from 'react';

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
			<div className="overlay-header">
				<h1>{heading}</h1>
			<button
				className="themed-button close-button"
				onClick={closeOverlay}
				aria-label="close overlay"
			>
				close<span className="overlay-close-icon"aria-hidden>X</span>
			</button>
			</div>

			<div className="overlay-content">{children}</div>
		</div>
	);
}

export default Overlay;
