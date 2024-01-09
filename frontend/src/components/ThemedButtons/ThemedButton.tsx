import { clsx } from 'clsx';
import { ReactNode } from 'react';

import './ThemedButton.css';

export interface ThemedButtonProps {
	children: ReactNode;
	ariaDisabled?: boolean;
	ariaLabel?: string;
	className?: string;
	tooltip?: {
		id: string;
		text: string;
	};
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

	const tooltipId = `themed-button-desc-${tooltip?.id
		.replace(/\s/g, '-')
		.toLowerCase()}`;

	return (
		<>
			<button
				className={buttonClass}
				onClick={onClickDisabledCheck}
				aria-describedby={tooltipId}
				aria-disabled={ariaDisabled}
				aria-label={ariaLabel}
			>
				{children}
			</button>
			{tooltip && (
				<div role="tooltip" id={tooltipId} className="themed-button-tooltip">
					{tooltip.text}
				</div>
			)}
		</>
	);
}

export default ThemedButton;
