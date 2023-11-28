import { clsx } from 'clsx';
import { ReactNode } from 'react';

import './ThemedButton.css';

export interface ThemedButtonProps {
	children: ReactNode;
	ariaDisabled?: boolean;
	disabled?: boolean;
	selected?: boolean;
	title?: string;
	onClick: () => void;
	appearsDifferentWhenDisabled?: boolean;
}

function ThemedButton({
	children,
	onClick,
	ariaDisabled = false,
	disabled = false,
	selected = false,
	title = '',
	appearsDifferentWhenDisabled = true,
}: ThemedButtonProps) {
	function onClickDisabledCheck() {
		if (!disabled && !ariaDisabled) onClick();
	}

	const buttonClass = clsx('themed-button', {
		selected,
		disabled: appearsDifferentWhenDisabled && (disabled || ariaDisabled),
	});

	return (
		<button
			className={buttonClass}
			onClick={onClickDisabledCheck}
			aria-disabled={ariaDisabled}
			disabled={disabled}
			title={title}
		>
			{children}
		</button>
	);
}

export default ThemedButton;
