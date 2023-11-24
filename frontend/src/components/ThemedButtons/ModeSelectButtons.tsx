import { clsx } from 'clsx';

import { LEVEL_NAMES, ModeSelectButton } from '@src/models/level';

import './ModeSelectButtons.css';

function ModeSelectButtons({
	defaultSelection,
	modeButtons,
	setLevel,
}: {
	defaultSelection: LEVEL_NAMES;
	modeButtons: ModeSelectButton[];
	setLevel: (newLevel: LEVEL_NAMES) => void;
}) {
	function defaultButton(targetLevel: LEVEL_NAMES) {
		return targetLevel === defaultSelection;
	}

	return (
		<ul className="mode-selection-buttons" aria-label="mode selector">
			{modeButtons.map((modeButton) => (
				<li
					key={modeButton.targetLevel}
					aria-current={
						defaultButton(modeButton.targetLevel) ? 'page' : undefined
					}
				>
					<button
						className={clsx('mode-button', {
							selected: defaultButton(modeButton.targetLevel),
						})}
						onClick={() => {
							setLevel(modeButton.targetLevel);
						}}
					>
						{modeButton.displayName}
					</button>
				</li>
			))}
		</ul>
	);
}

export default ModeSelectButtons;
