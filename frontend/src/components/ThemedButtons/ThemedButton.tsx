import { clsx } from 'clsx';
import { ReactNode } from 'react';

import './ThemedButton.css';

export interface ThemedButtonProps {
	children: ReactNode;
	appearsDifferentWhenDisabled?: boolean;
	ariaDisabled?: boolean;
	ariaLabel?: string;
	disabled?: boolean;
	title?: string;
	onClick: () => void;
}

function ThemedButton({
	children,
	appearsDifferentWhenDisabled = true,
	ariaDisabled = false,
	ariaLabel,
	disabled = false,
	title,
	onClick,
}: ThemedButtonProps) {
	function onClickDisabledCheck() {
		if (!disabled && !ariaDisabled) onClick();
	}

	const buttonClass = clsx('themed-button', {
		disabled: appearsDifferentWhenDisabled && (disabled || ariaDisabled),
	});

	return (
		<button
			className={buttonClass}
			onClick={onClickDisabledCheck}
			aria-disabled={ariaDisabled}
			aria-label={ariaLabel}
			disabled={disabled}
			title={title}
		>
			{children}
		</button>
	);
}

export default ThemedButton;
