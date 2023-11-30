import { clsx } from 'clsx';
import { ReactNode } from 'react';

import './ThemedButton.css';

export interface ThemedButtonProps {
	children: ReactNode;
	disabled?: boolean;
	selected?: boolean;
	title?: string;
	onClick: () => void;
	appearsDifferentWhenDisabled?: boolean;
	ariaLabel?: string;
}

function ThemedButton({
	children,
	onClick,
	disabled = false,
	selected = false,
	title,
	appearsDifferentWhenDisabled = true,
	ariaLabel,
}: ThemedButtonProps) {
	const buttonProps = {
		className: clsx('themed-button', {
			selected,
			appearsDifferentWhenDisabled,
		}),
		onClick,
		disabled,
		title,
		'aria-label': ariaLabel,
	};

	return <button {...buttonProps}>{children}</button>;
}

export default ThemedButton;
