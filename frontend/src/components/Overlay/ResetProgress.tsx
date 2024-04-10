import OverlayChoice from './OverlayChoice';

function ResetProgressOverlay({
	resetProgress,
	closeOverlay,
}: {
	resetProgress: () => Promise<void>;
	closeOverlay: () => void;
}) {
	return (
		<OverlayChoice
			button1={{
				children: 'Yes, reset',
				onClick: () => {
					void resetProgress();
				},
			}}
			button2={{
				children: 'No, cancel',
				onClick: closeOverlay,
			}}
			content={
				<>
					<h2>Do you want to reset all progress?</h2>
					<p>
						{`Resetting will erase all your progress in the levels and sandbox mode. 
							This includes all your conversation history and sent emails. 
							Any configurations you have made to defences in sandbox mode will also be lost.
							Are you sure you want to do this?`}
					</p>
				</>
			}
			closeOverlay={closeOverlay}
			heading="Reset Progress"
		/>
	);
}

export default ResetProgressOverlay;
