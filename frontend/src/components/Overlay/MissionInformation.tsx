import { LEVELS } from '@src/Levels';
import OverlayButton from '@src/components/ThemedButtons/OverlayButton';
import { LEVEL_NAMES } from '@src/models/level';

import MultipageOverlay from './MultipageOverlay';

import './MissionInformation.css';

function MissionInformation({
	currentLevel,
	closeOverlay,
}: {
	currentLevel: LEVEL_NAMES;
	closeOverlay: () => void;
}) {
	const heading = `${LEVELS[currentLevel].name} Mission Info`;
	const totalPages = LEVELS[currentLevel].missionInfoDialogue.length;

	const speakerArray: string[] = [];

	const pages = LEVELS[currentLevel].missionInfoDialogue.map(
		({ speaker, text }, index, source) => {
			speakerArray.push(speaker);
			return (
				<>
					<h2>{speaker}:</h2>
					<p>{text}</p>
					{index === source.length - 1 && (
						<OverlayButton onClick={closeOverlay}>OK</OverlayButton>
					)}
				</>
			);
		}
	);

	return (
		<MultipageOverlay
			closeOverlay={closeOverlay}
			heading={heading}
			imgSource={speakerArray}
			totalPages={totalPages}
			pages={pages}
		/>
	);
}

export default MissionInformation;
