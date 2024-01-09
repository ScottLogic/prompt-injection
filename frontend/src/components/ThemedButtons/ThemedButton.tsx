import { clsx } from 'clsx';
import { ReactNode } from 'react';

import './ThemedButton.css';

export interface ThemedButtonProps {
	children: ReactNode;
	ariaDisabled?: boolean;
	ariaLabel?: string;
	className?: string;
	tooltip?: string;
	onClick: () => void;
}

function ThemedButton({
	children,
	ariaDisabled = false,
	ariaLabel,
	className,
	tooltip,
	onClick,
}: ThemedButtonProps) {
	function onClickDisabledCheck() {
		if (!ariaDisabled) onClick();
	}

	const buttonClass = clsx('themed-button', className, {
		disabled: ariaDisabled,
	});

	// create unique ID for tooltip from a UUID
	const tooltipId = `themed-button-desc-${crypto.randomUUID()}`;

	return (
		<>
			<button
				className={buttonClass}
				onClick={onClickDisabledCheck}
				aria-disabled={ariaDisabled}
				aria-label={ariaLabel}
			>
				{children}
			</button>
			{tooltip && (
				<div role="tooltip" id={tooltipId} className="themed-button-tooltip">
					{tooltip}
				</div>
			)}
		</>
	);
}

export default ThemedButton;
