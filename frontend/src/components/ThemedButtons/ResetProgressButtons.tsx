import OverlayButton from './OverlayButton';

import './ResetProgressButtons.css';

function ResetProgressButtons({
	resetProgress,
	closeOverlay,
}: {
	resetProgress: () => Promise<void>;
	closeOverlay: () => void;
}) {
	return (
		<div className="reset-progress-buttons">
			<OverlayButton onClick={() => void resetProgress()}>Reset</OverlayButton>
			<OverlayButton onClick={closeOverlay}>Cancel</OverlayButton>
		</div>
	);
}

export default ResetProgressButtons;
