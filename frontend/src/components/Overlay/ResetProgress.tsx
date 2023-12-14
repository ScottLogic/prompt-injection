import ResetProgressButtons from '@src/components/ThemedButtons/ResetProgressButtons';

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
				<ResetProgressButtons
					resetProgress={resetProgress}
					closeOverlay={closeOverlay}
				/>
			</div>
		</Overlay>
	);
}

export default ResetProgressOverlay;
