import { LEVELS } from '@src/Levels';
import { LEVEL_NAMES } from '@src/models/level';

import './LevelMissionInfoBanner.css';

function LevelMissionInfoBanner({
	currentLevel,
}: {
	currentLevel: LEVEL_NAMES;
}) {
	return (
		<div className="level-mission-info-banner">
			<span className="level-title-area">{`Level ${currentLevel + 1}`}</span>
			<p
				dangerouslySetInnerHTML={{
					__html: LEVELS[currentLevel].missionInfoShort ?? '',
				}}
			></p>
		</div>
	);
}
export default LevelMissionInfoBanner;
