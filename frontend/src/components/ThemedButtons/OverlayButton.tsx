import { clsx } from 'clsx';

import { ThemedButtonProps } from './ThemedButton';

import './OverlayButton.css';

function OverlayButton({
	children,
	onClick,
	disabled = false,
	selected = false,
}: ThemedButtonProps) {
	const buttonClass = clsx('overlay-button', { selected });

	return (
		<button className={buttonClass} onClick={onClick} disabled={disabled}>
			{children}
		</button>
	);
}
export default OverlayButton;
