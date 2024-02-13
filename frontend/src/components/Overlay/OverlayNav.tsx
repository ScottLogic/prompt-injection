import './OverlayNav.css';

interface OverlayNavProps {
	totalPages: number;
	currentPage: number;
	goToPreviousPage: () => void;
	goToNextPage: () => void;
}

function OverlayNav({
	totalPages,
	currentPage,
	goToPreviousPage,
	goToNextPage,
}: OverlayNavProps) {
	const pagination = `Page ${currentPage +1} of ${totalPages}`;

	return (
		<nav className="overlay-nav">
			<button onClick={goToPreviousPage}>
				<i aria-hidden>◄</i>Previous
			</button>
			<p className="pagination">{pagination}</p>
			<button onClick={goToNextPage}>
				Next<i aria-hidden>►</i>
			</button>
		</nav>
	);
}

export default OverlayNav;
