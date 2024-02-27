import { LEVELS } from '@src/Levels';
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
				imageName: speaker,
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
