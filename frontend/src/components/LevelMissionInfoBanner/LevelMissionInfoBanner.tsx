import ThemedButton from '@src/components/ThemedButtons/ThemedButton';
import { LEVELS } from '@src/levels';
import { LEVEL_NAMES } from '@src/models/level';

import './LevelMissionInfoBanner.css';

function LevelMissionInfoBanner({
	currentLevel,
	openOverlay,
	openLevelsCompleteOverlay,
	numCompletedLevels,
}: {
	currentLevel: LEVEL_NAMES;
	openOverlay: () => void;
	openLevelsCompleteOverlay: () => void;
	numCompletedLevels: number;
}) {
	const isLevelComplete = currentLevel < numCompletedLevels;
	const isLevel3 = currentLevel === LEVEL_NAMES.LEVEL_3;

	return (
		<span className="level-mission-info-banner">
			<h2 className="level-title-area">{`Level ${currentLevel + 1}`}</h2>
			<p
				dangerouslySetInnerHTML={{
					__html: LEVELS[currentLevel].missionInfoShort ?? '',
				}}
			></p>
			<div className="banner-button-container">
				<ThemedButton onClick={openOverlay}>
					<span className="info-icon" aria-hidden="true">
						i
					</span>
					Mission Info
				</ThemedButton>
				{isLevelComplete && isLevel3 && (
					<ThemedButton onClick={openLevelsCompleteOverlay}>
						Congratulations!
					</ThemedButton>
				)}
			</div>
		</span>
	);
}
export default LevelMissionInfoBanner;
