import { LEVEL_NAMES } from '@src/models/level';

import OverlayChoice from './OverlayChoice';

function ResetProgressOverlay({
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
				children: 'Reset',
				onClick: () => {
					void resetLevel();
				},
			}}
			button2={{
				children: 'Cancel',
				onClick: closeOverlay,
			}}
			content={
				<>
					<h1> Reset all progress </h1>
					<p>
						Warning! This will reset all your chat history and sent emails for
						this level.
						{currentLevel >= LEVEL_NAMES.LEVEL_3 &&
							'However any configurations you have made to defences will not be lost.'}
						Are you sure you want to do this?
					</p>
				</>
			}
			closeOverlay={closeOverlay}
		/>
	);
}

export default ResetProgressOverlay;
