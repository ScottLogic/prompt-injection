import { PropsWithChildren, useState } from 'react';

import './DetailElement.css';

export interface DetailElementProps extends PropsWithChildren {
	useIcon: boolean;
	buttonText: string;
	onExpanded?: () => void;
}

function DetailElement({
	useIcon,
	buttonText,
	children,
	onExpanded,
}: DetailElementProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	function onClick() {
		if (!isExpanded && onExpanded) {
			onExpanded();
		}
		setIsExpanded(!isExpanded);
	}

	return (
		<>
			<button
				className="details-button"
				type="button"
				aria-expanded={isExpanded}
				onClick={onClick}
			>
				{useIcon && (
					<span className="button-arrow-icon" aria-hidden>
						{isExpanded ? '\u2B9F' : '\u2B9E'}
						&nbsp;
					</span>
				)}
				{buttonText}
			</button>
			<div className="details-content">{children}</div>
		</>
	);
}

export default DetailElement;
