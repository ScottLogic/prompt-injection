import { ThemedButtonProps } from './ThemedButton';

import './OverlayButton.css';

function OverlayButton({
	children,
	onClick,
	disabled = false,
}: ThemedButtonProps) {
	return (
		<button className="overlay-button" onClick={onClick} disabled={disabled}>
			{children}
		</button>
	);
}
export default OverlayButton;
