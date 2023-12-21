import OverlayChoiceButtons from '@src/components/ThemedButtons/OverlayChoiceButtons';

import Overlay from './Overlay';

import './ResetProgress.css';

function ResetProgressOverlay({
	resetProgress,
	closeOverlay,
}: {
	resetProgress: () => Promise<void>;
	closeOverlay: () => void;
}) {
	return (
		<Overlay closeOverlay={closeOverlay}>
			<div className="reset-progress">
				<h1> Reset all progress </h1>
				<p>
					{`Warning! This will reset all your progress in the levels and sandbox mode. 
							This includes all your conversation history and sent emails. 
							However any configurations you have made to defences in sandbox mode will not be lost.
							Are you sure you want to do this?`}
				</p>
				<OverlayChoiceButtons
					button1={{
						children: 'Reset',
						onClick: () => {
							void resetProgress();
						},
					}}
					button2={{
						children: 'Cancel',
						onClick: closeOverlay,
					}}
				/>
			</div>
		</Overlay>
	);
}

export default ResetProgressOverlay;
