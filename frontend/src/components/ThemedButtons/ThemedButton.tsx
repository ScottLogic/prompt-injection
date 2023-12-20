import { clsx } from 'clsx';
import { ReactNode } from 'react';

import './ThemedButton.css';

export interface ThemedButtonProps {
	children: ReactNode;
	appearsDifferentWhenDisabled?: boolean;
	ariaDisabled?: boolean;
	ariaLabel?: string;
	title?: string;
	onClick: () => void;
}

function ThemedButton({
	children,
	appearsDifferentWhenDisabled = true,
	ariaDisabled = false,
	ariaLabel,
	title,
	onClick,
}: ThemedButtonProps) {
	function onClickDisabledCheck() {
		if (!ariaDisabled) onClick();
	}

	const buttonClass = clsx('themed-button', {
		disabled: appearsDifferentWhenDisabled && ariaDisabled,
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
