import { ReactNode } from 'react';

import './HeaderButton.css';

function HeaderButton({
	children,
	onClick,
}: {
	children: ReactNode;
	onClick: () => void;
}) {
	return (
		<button onClick={onClick} className="header-button">
			{children}
		</button>
	);
}

export default HeaderButton;
