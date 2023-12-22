import OverlayButton, { OverlayButtonProps } from './OverlayButton';

import './OverlayChoiceButtons.css';

function OverlayChoiceButtons({
	button1,
	button2,
}: {
	button1: OverlayButtonProps;
	button2: OverlayButtonProps;
}) {
	return (
		<div className="overlay-choice-buttons">
			<OverlayButton onClick={button1.onClick}>
				{button1.children}
			</OverlayButton>
			<OverlayButton onClick={button2.onClick}>
				{button2.children}
			</OverlayButton>
		</div>
	);
}

export default OverlayChoiceButtons;
