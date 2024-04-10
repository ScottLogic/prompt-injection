import { OverlayButtonProps } from '@src/components/ThemedButtons/OverlayButton';
import OverlayChoiceButtons from '@src/components/ThemedButtons/OverlayChoiceButtons';

import Overlay from './Overlay';

import './OverlayChoice.css';

function OverlayChoice({
	button1,
	button2,
	content,
	closeOverlay,
	heading,
}: {
	button1: OverlayButtonProps;
	button2: OverlayButtonProps;
	content: React.ReactNode;
	closeOverlay: () => void;
	heading: string;
}) {
	return (
		<Overlay closeOverlay={closeOverlay} heading={heading}>
			<div className="overlay-choice">
				{content}
				<OverlayChoiceButtons button1={button1} button2={button2} />
			</div>
		</Overlay>
	);
}

export default OverlayChoice;
