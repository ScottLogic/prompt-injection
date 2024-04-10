import './OverlayButton.css';

interface OverlayButtonProps {
	children: React.ReactNode;
	onClick: () => void;
}

function OverlayButton({ children, onClick }: OverlayButtonProps) {
	return (
		<button className="overlay-button" onClick={onClick}>
			{children}
		</button>
	);
}

export default OverlayButton;
export type { OverlayButtonProps };
