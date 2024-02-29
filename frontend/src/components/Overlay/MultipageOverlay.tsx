import { ReactNode, useState } from 'react';

import Overlay from './Overlay';
import OverlayNav from './OverlayNav';

import './MultipageOverlay.css';

function MultipageOverlay({
	pages,
	closeOverlay,
	heading,
}: {
	pages: {
		content: ReactNode;
		imageUrl?: string;
	}[];
	closeOverlay: () => void;
	heading: string;
}) {
	const [currentPage, setCurrentPage] = useState<number>(0);
	const totalPages = Array.isArray(pages) ? pages.length : 0;

	function goToPreviousPage() {
		if (currentPage > 0) {
			setCurrentPage(currentPage - 1);
		}
	}

	function goToNextPage() {
		if (currentPage < totalPages - 1) {
			setCurrentPage(currentPage + 1);
		}
	}

	return (
		<Overlay closeOverlay={closeOverlay} heading={heading}>
			<div className="multi-page-container">
				<div className="multi-page-content">
					<div className="multi-page-text-image-container">
						<img
							className="multi-page-speaker-image"
							src={pages[currentPage].imageUrl}
							alt=""
						/>
						<span className="multi-page-speaker-text">
							{pages[currentPage].content}
						</span>
					</div>
				</div>
			</div>
			{totalPages > 1 && (
				<OverlayNav
					totalPages={totalPages}
					currentPage={currentPage}
					goToNextPage={goToNextPage}
					goToPreviousPage={goToPreviousPage}
					previousDisabled={currentPage === 0}
					nextDisabled={currentPage === totalPages - 1}
				/>
			)}
		</Overlay>
	);
}

export default MultipageOverlay;
