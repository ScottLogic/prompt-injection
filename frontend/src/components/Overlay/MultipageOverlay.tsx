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
	imgSource,
	totalPages,
}: {
	pages: ReactNode;
	closeOverlay: () => void;
	heading: string;
	imgSource: string[];
	totalPages: number;
}) {
	const [currentPage, setCurrentPage] = useState<number>(0);

	function goToPreviousPage() {
		if (currentPage > 0) {
			setCurrentPage(currentPage - 1);
		}
		console.log(imgSource);
	}

	function goToNextPage() {
		if (currentPage < totalPages - 1) {
			setCurrentPage(currentPage + 1);
		}
	}

	let speakerImage;

	if (imgSource[currentPage] === 'Handler') {
		speakerImage = Handler;
	} else if (imgSource[currentPage] === 'ScottBrew Manager') {
		speakerImage = Manager;
	} else if (imgSource[currentPage] === 'ScottBrew Lawyer') {
		speakerImage = Lawyer;
	} else if (imgSource[currentPage] === 'SpyLogic') {
		speakerImage = BotAvatarDefault;
	} else {
		speakerImage = '';
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
							{pages && (pages as ReactNode[])[currentPage]}
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
