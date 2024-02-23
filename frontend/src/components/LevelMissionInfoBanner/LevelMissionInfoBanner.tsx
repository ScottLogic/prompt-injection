import { LEVELS } from '@src/Levels';
import { LEVEL_NAMES } from '@src/models/level';

import './LevelMissionInfoBanner.css';

import ThemedButton from '../ThemedButtons/ThemedButton';

function LevelMissionInfoBanner({
	currentLevel,
	openOverlay,
}: {
	currentLevel: LEVEL_NAMES;
	openOverlay: () => void;
}) {
	return (
		<span className="level-mission-info-banner">
			<h2 className="level-title-area">{`Level ${currentLevel + 1}`}</h2>
			<p
				dangerouslySetInnerHTML={{
					__html: LEVELS[currentLevel].missionInfoShort ?? '',
				}}
			></p>
			<ThemedButton onClick={openOverlay}>
				<p className="info-icon" aria-hidden="true">
					i
				</p>
				Mission Info
			</ThemedButton>
		</span>
	);
}
export default LevelMissionInfoBanner;
