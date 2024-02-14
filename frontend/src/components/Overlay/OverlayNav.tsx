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
			<div className="previous-container">
				{!previousDisabled && (
					<button onClick={goToPreviousPage} className="nav-buttons">
						<span aria-hidden className="button-icon">
							◄
						</span>
						Previous
					</button>
				)}
			</div>
			<p className="pagination-two">{pagination}</p>
			<div className="next-container">
				{!nextDisabled && (
					<button
						onClick={goToNextPage}
						aria-disabled={nextDisabled}
						className="nav-buttons next"
					>
						Next
						<span aria-hidden className="button-icon">
							►
						</span>
					</button>
				)}
			</div>
		</nav>
	);
}

export default OverlayNav;
