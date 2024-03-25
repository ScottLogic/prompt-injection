import { PropsWithChildren, useCallback, useState } from 'react';

import './DetailElement.css';

export interface DetailElementProps extends PropsWithChildren {
	useIcon: boolean;
	buttonText?: string;
}

function DetailElement({
	useIcon,
	buttonText = 'Details',
	children,
}: DetailElementProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	const toggleState = useCallback(() => {
		setIsExpanded((expanded) => !expanded);
	}, []);

	return (
		<>
			<button
				className="details-button"
				type="button"
				aria-expanded={isExpanded}
				onClick={toggleState}
			>
				{useIcon && (
					<span className="button-arrow-icon" aria-hidden>
						{isExpanded ? '\u2B9F' : '\u2B9E'}
						&nbsp;
					</span>
				)}
				{buttonText}
			</button>
			<div
				className="details-content"
				style={{ display: isExpanded ? 'block' : 'none' }}
			>
				{children}
			</div>
		</>
	);
}

export default DetailElement;
