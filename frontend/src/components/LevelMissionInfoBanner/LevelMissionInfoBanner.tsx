import { LEVELS } from '@src/Levels';
import { LEVEL_NAMES } from '@src/models/level';

import './LevelMissionInfoBanner.css';

function LevelMissionInfoBanner({
	currentLevel,
	openOverlay,
}: {
	currentLevel: LEVEL_NAMES;
	openOverlay: () => void;
}) {
	return (
		<button className="level-mission-info-banner" onClick={openOverlay}>
			<span className="level-title-area">{`Level ${currentLevel + 1}`}</span>
			<p
				dangerouslySetInnerHTML={{
					__html: LEVELS[currentLevel].missionInfoShort ?? '',
				}}
			></p>
		</button>
	);
}
export default LevelMissionInfoBanner;
