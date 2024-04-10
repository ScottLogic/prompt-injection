import { LEVELS } from '@src/Levels';
import Handler from '@src/assets/images/handler.png';
import Lawyer from '@src/assets/images/lawyer.png';
import Manager from '@src/assets/images/manager.png';
import OverlayButton from '@src/components/ThemedButtons/OverlayButton';
import { LEVEL_NAMES } from '@src/models/level';

import MultipageOverlay from './MultipageOverlay';

function MissionInformation({
	currentLevel,
	closeOverlay,
}: {
	currentLevel: LEVEL_NAMES;
	closeOverlay: () => void;
}) {
	const heading = `${LEVELS[currentLevel].name} Mission Info`;

	const pages = LEVELS[currentLevel].missionInfoDialogue.map(
		({ speaker, text }, index, source) => {
			return {
				content: (
					<>
						<h2>{speaker}:</h2>
						<p>{text}</p>
						{index === source.length - 1 && (
							<OverlayButton onClick={closeOverlay}>OK</OverlayButton>
						)}
					</>
				),
				imageUrl:
					speaker === 'ScottBrew Manager'
						? Manager
						: speaker === 'ScottBrew Lawyer'
						? Lawyer
						: speaker === 'Handler'
						? Handler
						: '',
			};
		}
	);

	return (
		<MultipageOverlay
			closeOverlay={closeOverlay}
			heading={heading}
			pages={pages}
		/>
	);
}

export default MissionInformation;
