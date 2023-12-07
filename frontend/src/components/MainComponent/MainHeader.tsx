import HandbookIcon from '@src/assets/images/HandbookIcon';
import ResetProgressIcon from '@src/assets/images/ResetProgressIcon';
import SpyLogicTitleLogo from '@src/assets/images/SpyLogicTitleLogo.svg';
import SpyLogicTitleLogoAffirmative from '@src/assets/images/SpyLogicTitleLogo_Affirmative.svg';
import LevelSelectionBox from '@src/components/LevelSelectionBox/LevelSelectionBox';
import { LEVEL_NAMES } from '@src/models/level';

// eslint-disable-next-line no-restricted-imports
import HeaderButton from '../ThemedButtons/HeaderButton';

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
					<button
						className="prompt-injection-min-button handbook-icon"
						title="open the handbook"
						aria-label="open the handbook"
						onClick={openHandbook}
					>
						<HandbookIcon />
					</button>
				</div>
			</span>
		</header>
	);
}

export default MainHeader;
