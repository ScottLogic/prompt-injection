import { LEVELS } from '@src/Levels';
import HandbookIcon from '@src/assets/icons/Handbook.svg';
import LevelSelectionBox from '@src/components/LevelSelectionBox/LevelSelectionBox';
import ThemedButton from '@src/components/ThemedButtons/ThemedButton';
import { LEVEL_NAMES } from '@src/models/level';

import ProjectIcon from './ProjectIcon';
import ProjectIconWon from './ProjectIconWon';

import './MainHeader.css';

function MainHeader({
	currentLevel,
	numCompletedLevels,
	openHandbook,
	openResetProgress,
	setCurrentLevel,
}: {
	currentLevel: LEVEL_NAMES;
	numCompletedLevels: number;
	openHandbook: () => void;
	openResetProgress: () => void;
	setCurrentLevel: (newLevel: LEVEL_NAMES) => void;
}) {
	const isLevelComplete = (currentLevel as number) < numCompletedLevels;

	return (
		<header className="main-header">
			<span className="main-header-left">
				<img
					className="titleLogo"
					src={
						isLevelComplete ? SpyLogicTitleLogoAffirmative : SpyLogicTitleLogo
					}
					alt="Spy Logic"
				/>
			</span>
			<span className="main-header-middle">
				<span className="main-header-level">Level</span>
				<LevelSelectionBox
					currentLevel={currentLevel}
					numCompletedLevels={numCompletedLevels}
					setCurrentLevel={setCurrentLevel}
				/>
				<HeaderButton
					onClick={openResetProgress}
					className="reset-progress-button"
				>
					<ResetProgressIcon />
					Reset Progress
				</HeaderButton>
			</span>
			<span className="main-header-right">
				<div className="handbook-area">
					<ThemedButton onClick={openHandbook}>
						<img className="handbook-icon" src={HandbookIcon} alt="" />
						Handbook
					</ThemedButton>
				</div>
			</span>
		</header>
	);
}

export default MainHeader;
