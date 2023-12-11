import { ThemedButtonProps } from './ThemedButton';

import './OverlayButton.css';

function OverlayButton({
	children,
	onClick,
}: Pick<ThemedButtonProps, 'children' | 'onClick'>) {
	return (
		<button className="overlay-button" onClick={onClick}>
			{children}
		</button>
	);
}
export default OverlayButton;
