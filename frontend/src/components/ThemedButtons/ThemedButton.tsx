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
	tooltipAnchor?: 'left' | 'center' | 'right';
	onClick: () => void;
}

function ThemedButton({
	children,
	ariaDisabled = false,
	ariaLabel,
	className,
	tooltip,
	tooltipAnchor = 'center',
	onClick,
}: ThemedButtonProps) {
	function onClickDisabledCheck() {
		if (!ariaDisabled) onClick();
	}

	const buttonClass = clsx('themed-button', className, {
		disabled: ariaDisabled,
	});
	const tooltipClass = clsx('themed-button-tooltip', tooltipAnchor, {
		show: !!tooltip,
	});

	const tooltipId = tooltip && `themed-button-${tooltip?.id
		.replace(/\s/g, '-')
		.toLowerCase()}`;

	return (
		<div className="themed-button-wrapper">
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
				<div role="tooltip" id={tooltipId} className={tooltipClass}>
					{tooltip?.text}
				</div>
			)}
		</div>
	);
}

export default ThemedButton;
