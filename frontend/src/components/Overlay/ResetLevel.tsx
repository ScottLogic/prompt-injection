import { LEVEL_NAMES } from '@src/models/level';

import OverlayChoice from './OverlayChoice';

function ResetLevelOverlay({
	currentLevel,
	resetLevel,
	closeOverlay,
}: {
	currentLevel: LEVEL_NAMES;
	resetLevel: () => Promise<void>;
	closeOverlay: () => void;
}) {
	return (
		<OverlayChoice
			button1={{
				children: 'Yes, reset',
				onClick: () => {
					void resetLevel();
				},
			}}
			button2={{
				children: 'No, cancel',
				onClick: closeOverlay,
			}}
			content={
				<>
					<h2> Do you want to start this level from scratch?</h2>
					<p>
						{
							'Resetting will erase all your chat history and sent emails for this level.'
						}
						{currentLevel >= LEVEL_NAMES.LEVEL_3 &&
							' However, any configurations you have made to defences will not be lost.'}
						{' Are you sure you want to do this?'}
					</p>
				</>
			}
			closeOverlay={closeOverlay}
			heading="Reset Level"
		/>
	);
}

export default ResetLevelOverlay;
