import { useState } from 'react';

import { LEVELS } from '@src/Levels';
import Handler from '@src/assets/images/handler.png';
import Lawyer from '@src/assets/images/laywer.png';
import Manager from '@src/assets/images/manager.png';
import OverlayButton from '@src/components/ThemedButtons/OverlayButton';
import { LEVEL_NAMES } from '@src/models/level';

import Overlay from './Overlay';
import OverlayNav from './OverlayNav';

import './MissionInformation.css';

function MissionInformation({
	currentLevel,
	closeOverlay,
}: {
	currentLevel: LEVEL_NAMES;
	closeOverlay: () => void;
}) {
	const heading = `${LEVELS[currentLevel].name} Mission Information`;

	const [currentPage, setCurrentPage] = useState<number>(0);
	const totalPages = LEVELS[currentLevel].missionInfoDialogue.length;

	const speaker = LEVELS[currentLevel].missionInfoDialogue[currentPage].speaker;
	const text = LEVELS[currentLevel].missionInfoDialogue[currentPage].text;
	
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


	const imgSource =
		speaker === 'Handler' ? Handler :
		speaker === 'ScottBrew Manager' ? Manager :
		speaker === 'ScottBrew Lawyer' ? Lawyer :
		'';


	return (
		<Overlay closeOverlay={closeOverlay} heading={heading}>
			<div className="mission-information">
				<div className="content">
					<div className="text-image-container">
											<img
						className="speaker-image" 
						src={imgSource}
						alt=""
					/>
					<span className="speaker-text">
					<h2>{speaker}:</h2>
					<p>{text}</p>
					</span>
					</div>
					{currentPage === totalPages - 1 && (
						<div className="button-area">
							<OverlayButton onClick={closeOverlay}>OK</OverlayButton>
						</div>
					)}
				</div>
			</div>
			{totalPages > 1 && (
				<OverlayNav 
					totalPages={totalPages}
					currentPage={currentPage}
					goToNextPage={goToNextPage}
					goToPreviousPage={goToPreviousPage}
				/>
			)}
		</Overlay>
	);
}

export default MissionInformation;
