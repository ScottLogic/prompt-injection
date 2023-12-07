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
				<div className="content">
					<p>
						{
							'Warning! This will reset all your progress in the levels and Sandbox mode. Are you sure you want to do this?'
						}
					</p>
				</div>
				<ResetProgressButtons
					resetProgress={resetProgress}
					closeOverlay={closeOverlay}
				/>
			</div>
		</Overlay>
	);
}

export default ResetProgressOverlay;
