import { LEVELS } from '@src/Levels';
import HandbookIcon from '@src/assets/icons/Handbook.svg';
import SpyLogicTitleLogo from '@src/assets/images/SpyLogicTitleLogo.svg';
import SpyLogicTitleLogoAffirmative from '@src/assets/images/SpyLogicTitleLogo_Affirmative.svg';
import LevelSelectionBox from '@src/components/LevelSelectionBox/LevelSelectionBox';
import HeaderButton from '@src/components/ThemedButtons/HeaderButton';
import { LEVEL_NAMES } from '@src/models/level';

import './MainHeader.css';

function MainHeader({
	currentLevel,
	numCompletedLevels,
	openHandbook,
	setCurrentLevel,
}: {
	currentLevel: LEVEL_NAMES;
	numCompletedLevels: number;
	openHandbook: () => void;
	setCurrentLevel: (newLevel: LEVEL_NAMES) => void;
}) {
	function getLevelName(level: LEVEL_NAMES) {
		const levelName = LEVELS.find((p) => p.id === level)?.name;
		return levelName ?? '';
	}

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
				<span className="main-header-current-level">
					{getLevelName(currentLevel)}
				</span>
			</span>
			<span className="main-header-right">
				{currentLevel !== LEVEL_NAMES.SANDBOX && (
					<LevelSelectionBox
						currentLevel={currentLevel}
						numCompletedLevels={numCompletedLevels}
						setCurrentLevel={setCurrentLevel}
					/>
				)}
				<HeaderButton onClick={openHandbook} className="handbook-button">
					<img src={HandbookIcon} alt="" />
					Handbook
				</HeaderButton>
			</span>
		</header>
	);
}

export default MainHeader;
