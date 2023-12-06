import { LEVELS } from '@src/Levels';
import HandbookIcon from '@src/assets/icons/Handbook.svg';
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
				<span className="main-header-title">Spy Logic</span>
				<span className="main-header-icon">
					{isLevelComplete ? <ProjectIconWon /> : <ProjectIcon />}
				</span>
			</span>
			<span className="main-header-middle">
				<span className="main-header-current-level">
					{getLevelName(currentLevel)}
				</span>
			</span>
			<span className="main-header-right">
				{currentLevel !== LEVEL_NAMES.SANDBOX && (
					<span className="main-header-level-selection">
						<LevelSelectionBox
							currentLevel={currentLevel}
							numCompletedLevels={numCompletedLevels}
							setCurrentLevel={setCurrentLevel}
						/>
					</span>
				)}
				<div className="handbook-area">
					<HeaderButton onClick={openHandbook}>
						<img className="handbook-icon" src={HandbookIcon} alt="" />
						Handbook
					</HeaderButton>
				</div>
			</span>
		</header>
	);
}

export default MainHeader;
