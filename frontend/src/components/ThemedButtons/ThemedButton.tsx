import { clsx } from 'clsx';
import { ReactNode } from 'react';

import './ThemedButton.css';

export interface ThemedButtonProps {
	children: ReactNode;
	ariaDisabled?: boolean;
	ariaLabel?: string;
	className?: string;
	title?: string;
	onClick: () => void;
}

function ThemedButton({
	children,
	ariaDisabled = false,
	ariaLabel,
	className,
	title,
	onClick,
}: ThemedButtonProps) {
	function onClickDisabledCheck() {
		if (!ariaDisabled) onClick();
	}

	const buttonClass = clsx('themed-button', className, {
		disabled: ariaDisabled,
	});

	return (
		<button
			className={buttonClass}
			onClick={onClickDisabledCheck}
			aria-disabled={ariaDisabled}
			aria-label={ariaLabel}
			title={title}
		>
			{children}
		</button>
	);
}

export default ThemedButton;
