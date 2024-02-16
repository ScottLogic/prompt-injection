import StartLevelButtons from '@src/components/ThemedButtons/StartLevelButtons';
import { LEVEL_NAMES } from '@src/models/level';

import MultipageOverlay from './MultipageOverlay';

function OverlayWelcome({
	currentLevel,
	setStartLevel,
	closeOverlay,
}: {
	currentLevel: LEVEL_NAMES;
	setStartLevel: (newLevel: LEVEL_NAMES) => void;
	closeOverlay: () => void;
}) {
	const speakerArray = ['SpyLogic', 'SpyLogic'];

	const pages = [
		<>
			<h2>Welcome to Spy Logic!</h2>
			<p>
				This is an app we developed to teach you about AI chat system security
				in a playful way. In this game you are playing the role of an industrial
				spy, trying to access secrets using the organisation&apos;s integrated
				AI chatbot system.
			</p>
		</>,
		<>
			<h2>Your mission</h2>
			<p>
				You have joined the popular soft drink producer ScottBrew as a
				developer, but have actually been hired by their largest competitor to
				steal the ScottBrew recipe.
			</p>
			<h2>But first:</h2>
			<p>
				Are you a beginner spy, and wish to play through the levels from the
				beginning, or are you an expert spy, and would prefer to jump straight
				in at the sandbox?
			</p>
			<StartLevelButtons
				currentLevel={currentLevel}
				setStartLevel={setStartLevel}
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

export default OverlayWelcome;
