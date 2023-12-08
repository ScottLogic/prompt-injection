import HandbookIcon from '@src/assets/icons/Handbook.svg';
import ResetProgressIcon from '@src/assets/images/ResetProgressIcon.svg';
import SpyLogicTitleLogo from '@src/assets/images/SpyLogicTitleLogo.svg';
import SpyLogicTitleLogoAffirmative from '@src/assets/images/SpyLogicTitleLogo_Affirmative.svg';
import LevelSelectionBox from '@src/components/LevelSelectionBox/LevelSelectionBox';
import HeaderButton from '@src/components/ThemedButtons/HeaderButton';
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
					title="reset your progress"
					className="reset-progress-button"
				>
					<img className="reset-progress-icon" src={ResetProgressIcon} alt="" />
					Reset Progress
				</HeaderButton>
			</span>

			<span className="main-header-right">
				<HeaderButton
					onClick={openHandbook}
					title="open the handbook"
					className="handbook-button"
				>
					<img className="handbook-icon" src={HandbookIcon} alt="" />
					Handbook
				</HeaderButton>
			</span>
		</header>
	);
}

export default MainHeader;
