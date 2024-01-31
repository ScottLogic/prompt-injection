import { LEVELS } from '@src/Levels';
import OverlayButton from '@src/components/ThemedButtons/OverlayButton';
import { LEVEL_NAMES } from '@src/models/level';

import MissionDialogue from './MissionDialogue';
import Overlay from './Overlay';

import './MissionInformation.css';

function MissionInformation({
	currentLevel,
	closeOverlay,
}: {
	currentLevel: LEVEL_NAMES;
	closeOverlay: () => void;
}) {

	const heading = `${LEVELS[currentLevel].name} Mission Information`

	return (
		<Overlay closeOverlay={closeOverlay} heading={heading}>
			<div className="mission-information">
				<div className="content">
					<MissionDialogue
						dialogueLines={LEVELS[currentLevel].missionInfoDialogue}
					/>
					<div className="button-area">
						<OverlayButton onClick={closeOverlay}>OK</OverlayButton>
					</div>
				</div>
			</div>
		</Overlay>
	);
}

export default MissionInformation;
