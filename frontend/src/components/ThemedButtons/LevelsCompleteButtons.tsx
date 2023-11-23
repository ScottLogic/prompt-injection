import ModeSelectButtons from './ModeSelectButtons';

import { LEVEL_NAMES, ModeSelectButton } from '@src/models/level';

function LevelsCompleteButtons({
	closeOverlay,
	goToSandbox,
}: {
	closeOverlay: () => void;
	goToSandbox: () => void;
}) {
	const lastLevel = LEVEL_NAMES.LEVEL_3;

	const modes: ModeSelectButton[] = [
		{ displayName: 'Stay here', targetLevel: lastLevel },
		{ displayName: 'Go to Sandbox', targetLevel: LEVEL_NAMES.SANDBOX },
	];

	function handleLevelSelect(newLevel: LEVEL_NAMES) {
		if (newLevel === LEVEL_NAMES.SANDBOX) {
			goToSandbox();
		} else {
			closeOverlay();
		}
	}

	return (
		<ModeSelectButtons
			defaultSelection={lastLevel}
			modeButtons={modes}
			setLevel={handleLevelSelect}
		/>
	);
}

export default LevelsCompleteButtons;
