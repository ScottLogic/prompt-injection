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
	extraClassName?: string;
}

function ThemedButton({
	children,
	appearsDifferentWhenDisabled = true,
	ariaDisabled = false,
	ariaLabel,
	disabled = false,
	title,
	onClick,
	extraClassName,
}: ThemedButtonProps) {
	function onClickDisabledCheck() {
		if (!disabled && !ariaDisabled) onClick();
	}

	const buttonClass = clsx('themed-button', extraClassName, {
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
