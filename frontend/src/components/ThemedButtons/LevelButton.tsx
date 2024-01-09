import { clsx } from 'clsx';
import { ReactNode } from 'react';

import './LevelButton.css';

export interface LevelButtonProps {
	children: ReactNode;
	disabled?: boolean;
	selected?: boolean;
	ariaLabel?: string;
	tooltip?: string;
	onClick: () => void;
}

function LevelButton({
	children,
	disabled = false,
	selected = false,
	ariaLabel,
	tooltip,
	onClick,
}: LevelButtonProps) {
	const tooltipId = `level-button-desc-${ariaLabel}`;

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
			<button {...buttonProps}>{children}</button>
			{tooltip && (
				<div role="tooltip" id={tooltipId} className="level-button-tooltip">
					{tooltip}
				</div>
			)}
		</>
	);
}

export default LevelButton;
