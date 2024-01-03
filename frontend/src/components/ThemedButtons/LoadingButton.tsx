import { ThreeDots } from 'react-loader-spinner';

import ThemedButton from './ThemedButton';

import './LoadingButton.css';

function LoadingButton({
	children,
	isLoading = false,
	loadingTooltip,
	onClick,
}: {
	children: React.ReactNode;
	isLoading?: boolean;
	loadingTooltip?: string;
	onClick: () => void;
}) {
	return (
		<ThemedButton
			ariaDisabled={isLoading}
			// tooltip is shown when button is disabled
			title={isLoading ? loadingTooltip : undefined}
			className="loading-button"
			onClick={onClick}
		>
			{children}
			{isLoading && (
				<ThreeDots
					width="1.5rem"
					color="white"
					wrapperClass="loader"
					// blank label as by default the label is 'three-dots-loading'
					ariaLabel=""
				/>
			)}
		</ThemedButton>
	);
}

export default LoadingButton;
