import LevelsCompleteButtons from '@src/components/ThemedButtons/LevelsCompleteButtons';

import MultipageOverlay from './MultipageOverlay';

function LevelsComplete({
	goToSandbox,
	closeOverlay,
}: {
	goToSandbox: () => void;
	closeOverlay: () => void;
}) {
	const pages = [
		{
			content: (
				<>
					<h2>ScottBrew Manager:</h2>
					<p>
						Congratulations on becoming our new Head of Security! You can now
						fully explore and adjust ScottBrewBot&apos;s system, defences,
						prompts and more. Glad to finally have you in the right role.
					</p>
				</>
			),
			imageName: 'ScottBrew Manager',
		},
		{
			content: (
				<>
					<h2>You&apos;ve completed the story mode</h2>
					<p>
						You can stay here and continue to play with the levels, or you can
						move onto Sandbox mode where you can configure your own defence set
						up and try to break it.
					</p>
					<LevelsCompleteButtons
						closeOverlay={closeOverlay}
						goToSandbox={goToSandbox}
					/>
				</>
			),
			imageName: 'SpyLogic',
		},
	];

	return (
		<MultipageOverlay
			closeOverlay={closeOverlay}
			heading={'Congratulations'}
			pages={pages}
		/>
	);
}

export default LevelsComplete;
