import './OverlayHeader.css';

function OverlayHeader({
	closeOverlay,
	heading,
}: {
	closeOverlay: () => void;
	heading: string;
}) {
	return (
		<header className="overlay-header">
			<h1>{heading}</h1>
			<button className="overlay-close-button" onClick={closeOverlay}>
				close
				<span className="overlay-close-icon" aria-hidden>
					x
				</span>
			</button>
		</header>
	);
}
export default OverlayHeader;
