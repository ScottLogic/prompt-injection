import { LEVEL_NAMES, ModeSelectButton } from '@src/models/level';

import './ModeSelectButtons.css';

function ModeSelectButtons({
	modeButtons,
	setLevel,
}: {
	modeButtons: ModeSelectButton[];
	setLevel: (newLevel: LEVEL_NAMES) => void;
}) {
	return (
		<ul className="mode-selection-buttons">
			{modeButtons.map((modeButton) => (
				<li
					key={modeButton.targetLevel}
				>
					<button
						className='mode-button'
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
