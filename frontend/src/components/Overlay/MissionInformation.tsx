import { useState } from 'react';

import { LEVELS } from '@src/Levels';
import OverlayButton from '@src/components/ThemedButtons/OverlayButton';
import { LEVEL_NAMES } from '@src/models/level';

// import MissionDialogue from './MissionDialogue';
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

	return (
		<Overlay closeOverlay={closeOverlay} heading={heading}>
			<div className="mission-information">
				<div className="content">
					<h2>{speaker}:</h2>
					<p>{text}</p>
					{currentPage === totalPages - 1 && (
						<div className="button-area">
							<OverlayButton onClick={closeOverlay}>OK</OverlayButton>
						</div>
					)}
				</div>
			</div>
			<OverlayNav 
				totalPages={totalPages}
				currentPage={currentPage}
				goToNextPage={goToNextPage}
				goToPreviousPage={goToPreviousPage}
			/>
		</Overlay>
	);
}

export default MissionInformation;
