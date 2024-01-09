import { LEVELS } from '@src/Levels';
import LevelButton from '@src/components/ThemedButtons/LevelButton';
import { LEVEL_NAMES } from '@src/models/level';

import './LevelSelectionBox.css';

export interface LevelSelectionBoxProps {
	currentLevel: LEVEL_NAMES;
	numCompletedLevels: number;
	setCurrentLevel: (newLevel: LEVEL_NAMES) => void;
}

function LevelSelectionBox({
	currentLevel,
	numCompletedLevels,
	setCurrentLevel,
}: LevelSelectionBoxProps) {
	const displayLevels = LEVELS.map(({ id, name }) => ({
		id,
		displayName: id === LEVEL_NAMES.SANDBOX ? name : `${id + 1}`,
	}));

	function handleLevelChange(newLevel: LEVEL_NAMES) {
		if (newLevel !== currentLevel) {
			setCurrentLevel(newLevel);
		}
	}

	return (
		<div className="level-selection-box">
			{displayLevels.map(({ id, displayName }, index) => {
				const disabled =
					index > numCompletedLevels && id !== LEVEL_NAMES.SANDBOX;
				return (
					<LevelButton
						key={id}
						onClick={() => {
							handleLevelChange(id);
						}}
						disabled={disabled}
						selected={id === currentLevel}
						ariaLabel={
							id === LEVEL_NAMES.SANDBOX ? undefined : `Level ${displayName}`
						}
						// show tooltip if the button is disabled
						tooltip={disabled ? `Complete level ${index} to unlock` : undefined}
					>
						{displayName}
					</LevelButton>
				);
			})}
		</div>
	);
}

export default LevelSelectionBox;
