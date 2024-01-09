import { clsx } from 'clsx';

import './LevelButton.css';

export interface LevelButtonProps {
	displayName: string;
	disabled?: boolean;
	selected?: boolean;
	ariaLabel?: string;
	tooltip?: string;
	onClick: () => void;
}

function LevelButton({
	displayName,
	disabled = false,
	selected = false,
	ariaLabel,
	tooltip,
	onClick,
}: LevelButtonProps) {
	const tooltipId = `level-button-desc-${displayName.toLowerCase()}`;

	const buttonProps = {
		className: clsx('level-button', {
			selected,
		}),
		onClick: () => {
			!disabled && onClick();
		},
		'aria-describedby': tooltipId,
		'aria-disabled': disabled,
		'aria-label': ariaLabel,
	};

	return (
		<>
			<button {...buttonProps}>{displayName}</button>
			{tooltip && (
				<div role="tooltip" id={tooltipId} className="level-button-tooltip">
					{tooltip}
				</div>
			)}
		</>
	);
}

export default LevelButton;
