import { clsx } from 'clsx';
import { ReactNode } from 'react';

import './LevelButton.css';

export interface LevelButtonProps {
	children: ReactNode;
	disabled?: boolean;
	selected?: boolean;
	ariaLabel?: string;
	onClick: () => void;
}

function LevelButton({
	children,
	disabled = false,
	selected = false,
	ariaLabel,
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
	};

	return <button {...buttonProps}>{children}</button>;
}

export default LevelButton;
