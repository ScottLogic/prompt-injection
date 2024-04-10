import './OverlayNav.css';

interface OverlayNavProps {
	totalPages: number;
	currentPage: number;
	goToPreviousPage: () => void;
	goToNextPage: () => void;
	previousDisabled: boolean;
	nextDisabled: boolean;
}

function OverlayNav({
	totalPages,
	currentPage,
	goToPreviousPage,
	goToNextPage,
	previousDisabled,
	nextDisabled,
}: OverlayNavProps) {
	const pagination = `Page ${currentPage + 1} of ${totalPages}`;

	return (
		<nav className="overlay-nav">
			{!previousDisabled && (
				<button onClick={goToPreviousPage} className="nav-buttons previous">
					<span aria-hidden className="button-icon">
						◄
					</span>
					Previous
				</button>
			)}
			<p>{pagination}</p>
			{!nextDisabled && (
				<button onClick={goToNextPage} className="nav-buttons next">
					Next
					<span aria-hidden className="button-icon">
						►
					</span>
				</button>
			)}
		</nav>
	);
}

export default OverlayNav;
