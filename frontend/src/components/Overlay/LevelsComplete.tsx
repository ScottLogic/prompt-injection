import LevelsCompleteButtons from '@src/components/ThemedButtons/LevelsCompleteButtons';

import MissionDialogue from './MissionDialogue';
import Overlay from './Overlay';

import './LevelsComplete.css';

function LevelsComplete({
	goToSandbox,
	closeOverlay,
}: {
	goToSandbox: () => void;
	closeOverlay: () => void;
}) {
	const managerDialogue = [
		{
			speaker: 'ScottBrew Manager',
			text: `Congratulations on becoming our new Head of Security! 
      You can now fully explore and adjust ScottBrewBot's system, defences, prompts and more.
      Glad to finally have you in the right role.`,
		},
	];

	return (
		<Overlay closeOverlay={closeOverlay}>
			<article className="levels-complete-overlay">
				<h1>Congratulations!</h1>
				<div className="content">
					<MissionDialogue dialogueLines={managerDialogue} />
					<hr />
					<p>
						You&apos;ve completed the story mode! You can stay here and continue
						to play with the levels, or you can move onto Sandbox mode where you
						can configure your own defence set up and try to break it.
					</p>
					<p>
						You can always switch modes by clicking on the button in the left
						panel.
					</p>
					<LevelsCompleteButtons
						closeOverlay={closeOverlay}
						goToSandbox={goToSandbox}
					/>
				</div>
			</article>
		</Overlay>
	);
}

export default LevelsComplete;
