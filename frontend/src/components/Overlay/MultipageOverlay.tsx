import { ReactNode, useState } from 'react';

import BotAvatarDefault from '@src/assets/images/BotAvatarDefault.svg';
import Handler from '@src/assets/images/handler.png';
import Lawyer from '@src/assets/images/lawyer.png';
import Manager from '@src/assets/images/manager.png';

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
		imageName?: string;
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

	let speakerImage;

	if (pages[currentPage].imageName === 'Handler') {
		speakerImage = Handler;
	} else if (pages[currentPage].imageName === 'ScottBrew Manager') {
		speakerImage = Manager;
	} else if (pages[currentPage].imageName === 'ScottBrew Lawyer') {
		speakerImage = Lawyer;
	} else {
		speakerImage = BotAvatarDefault;
	}

	return (
		<Overlay closeOverlay={closeOverlay} heading={heading}>
			<div className="multi-page-container">
				<div className="multi-page-content">
					<div className="multi-page-text-image-container">
						<img
							className="multi-page-speaker-image"
							src={speakerImage}
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
