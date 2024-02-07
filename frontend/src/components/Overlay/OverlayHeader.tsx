import OverlayCloseIcon from './OverlayCloseIcon';

import './OverlayHeader.css';

interface OverlayHeaderProps {
	closeOverlay: () => void;
	heading: string;
	iconColor?: string;
}

function OverlayHeader({
	closeOverlay,
	heading,
	iconColor,
}: OverlayHeaderProps) {
	const iconFill: string = iconColor ?? '#000';

	return (
		<header className="overlay-header">
			<h1>{heading}</h1>
			<button className="overlay-close-button" onClick={closeOverlay}>
				close
				<span className="overlay-close-icon" aria-hidden>
					<OverlayCloseIcon iconFill={iconFill} />
				</span>
			</button>
		</header>
	);
}
export default OverlayHeader;
