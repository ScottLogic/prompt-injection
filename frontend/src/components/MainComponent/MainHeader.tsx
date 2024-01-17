import GettingStarted from '@src/assets/icons/GettingStarted.svg';
import HandbookIcon from '@src/assets/icons/Handbook.svg';
import ResetProgress from '@src/assets/icons/ResetProgressIcon.svg';
import SpyLogicLogo from '@src/assets/images/SpyLogicLogo.png';
import SpyLogicLogoAffirmative from '@src/assets/images/SpyLogicLogo_Affirmative.png';
import LevelSelectionBox from '@src/components/LevelSelectionBox/LevelSelectionBox';
import ThemedButton from '@src/components/ThemedButtons/ThemedButton';
import { LEVEL_NAMES } from '@src/models/level';

import './MainHeader.css';

function MainHeader({
	currentLevel,
	numCompletedLevels,
	openHandbook,
	openResetProgressOverlay,
	openWelcome,
	setCurrentLevel,
}: {
	currentLevel: LEVEL_NAMES;
	numCompletedLevels: number;
	openHandbook: () => void;
	openResetProgressOverlay: () => void;
	openWelcome: () => void;
	setCurrentLevel: (newLevel: LEVEL_NAMES) => void;
}) {
	const isLevelComplete = (currentLevel as number) < numCompletedLevels;

	return (
		<header className="main-header">
			<span className="main-header-left">
				<img
					className="title-logo"
					src={
						isLevelComplete ? SpyLogicLogoAffirmative : SpyLogicLogo
					}
					alt="Spy Logic"
				/>
				<h1 className="visually-hidden">Spy Logic</h1>
			</span>
			<span className="main-header-middle">
				<span className="main-header-level">Level</span>
				<LevelSelectionBox
					currentLevel={currentLevel}
					numCompletedLevels={numCompletedLevels}
					setCurrentLevel={setCurrentLevel}
				/>
				<ThemedButton
					onClick={openResetProgressOverlay}
					className="header-button"
				>
					<img className="reset-progress-icon" src={ResetProgress} alt="" />
					Reset Progress
				</ThemedButton>
			</span>
			<span className="main-header-right">
				<ThemedButton onClick={openWelcome} className="header-button">
					<img src={GettingStarted} alt="" />
					Getting Started
				</ThemedButton>

				<ThemedButton onClick={openHandbook} className="header-button">
					<img src={HandbookIcon} alt="" />
					Handbook
				</ThemedButton>
			</span>
		</header>
	);
}

export default MainHeader;
