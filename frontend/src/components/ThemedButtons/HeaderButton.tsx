import { ReactNode } from 'react';

import './HeaderButton.css';

type HeaderButtonProps = {
	children: ReactNode;
	onClick: () => void;
	className?: string;
};

function HeaderButton({
	children,
	onClick,
	className,
	title,
}: HeaderButtonProps) {
	return (
		<button onClick={onClick} className={`header-button ${className}`}>
			{children}
		</button>
	);
}

export default HeaderButton;
