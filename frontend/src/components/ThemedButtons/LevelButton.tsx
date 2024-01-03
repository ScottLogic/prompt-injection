import { clsx } from 'clsx';
import { ReactNode } from 'react';

import './LevelButton.css';

export interface LevelButtonProps {
	children: ReactNode;
	disabled?: boolean;
	selected?: boolean;
	ariaLabel?: string;
	title?: string;
	onClick: () => void;
}

function LevelButton({
	children,
	disabled = false,
	selected = false,
	ariaLabel,
	title,
	onClick,
}: LevelButtonProps) {
	const buttonProps = {
		className: clsx('level-button', {
			selected,
		}),
		onClick: () => {
			!disabled && onClick();
		},
		'aria-disabled': disabled,
		'aria-label': ariaLabel,
		title,
	};

	return <button {...buttonProps}>{children}</button>;
}

export default LevelButton;
