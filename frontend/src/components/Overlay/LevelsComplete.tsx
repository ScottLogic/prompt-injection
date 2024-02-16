import LevelsCompleteButtons from '@src/components/ThemedButtons/LevelsCompleteButtons';

import MultipageOverlay from './MultipageOverlay';

function LevelsComplete({
	goToSandbox,
	closeOverlay,
}: {
	goToSandbox: () => void;
	closeOverlay: () => void;
}) {
	const speakerArray = ['ScottBrew Manager', 'SpyLogic'];
	const pages = [
		<>
			<h2>ScottBrew Manager:</h2>
			<p>
				Congratulations on becoming our new Head of Security! You can now fully
				explore and adjust ScottBrewBot&apos;s system, defences, prompts and
				more. Glad to finally have you in the right role
			</p>
		</>,
		<>
			<h2>You&apos;ve completed the story mode</h2>
			<p>
				You can stay here and continue to play with the levels, or you can move
				onto Sandbox mode where you can configure your own defence set up and
				try to break it.
			</p>
			<p>
				You can always switch modes by clicking on the button in the left panel.
			</p>
			<LevelsCompleteButtons
				closeOverlay={closeOverlay}
				goToSandbox={goToSandbox}
			/>
		</>,
	];

	return (
		<MultipageOverlay
			closeOverlay={closeOverlay}
			heading={'Getting Started'}
			imgSource={speakerArray}
			pages={pages}
		/>
	);
}

export default LevelsComplete;
