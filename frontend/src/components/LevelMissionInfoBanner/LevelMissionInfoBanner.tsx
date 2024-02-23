import { LEVELS } from '@src/Levels';
import ThemedButton from '@src/components/ThemedButtons/ThemedButton';
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
		<span className="level-mission-info-banner">
			<h2 className="level-title-area">{`Level ${currentLevel + 1}`}</h2>
			<p
				data-testid="banner-info"
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
