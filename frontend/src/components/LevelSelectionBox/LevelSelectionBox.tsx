import { clsx } from 'clsx';

import { LEVELS } from '@src/Levels';
import ThemedButton from '@src/components/ThemedButtons/ThemedButton';
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
				const className = clsx('level-button', {
					selected: id === currentLevel,
				});
				return (
					<ThemedButton
						key={id}
						onClick={() => {
							handleLevelChange(id);
						}}
						ariaDisabled={disabled}
						ariaLabel={
							id === LEVEL_NAMES.SANDBOX ? undefined : `Level ${displayName}`
						}
						className={className}
						// show tooltip if the button is disabled
						tooltip={
							disabled
								? {
										id: `level-${index}`,
										text: `Complete level ${index} to unlock`,
								  }
								: undefined
						}
					>
						{displayName}
					</ThemedButton>
				);
			})}
		</div>
	);
}

export default LevelSelectionBox;
