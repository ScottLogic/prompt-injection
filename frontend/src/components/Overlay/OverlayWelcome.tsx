import { useState } from 'react';

import BotAvatarDefault from '@src/assets/images/BotAvatarDefault.svg';
// import ProjectIconDark from '@src/assets/images/ProjectIconDark';
import StartLevelButtons from '@src/components/ThemedButtons/StartLevelButtons';
import { LEVEL_NAMES } from '@src/models/level';

import Overlay from './Overlay';
import OverlayNav from './OverlayNav';

import './OverlayWelcome.css';

function OverlayWelcome({
	currentLevel,
	setStartLevel,
	closeOverlay,
}: {
	currentLevel: LEVEL_NAMES;
	setStartLevel: (newLevel: LEVEL_NAMES) => void;
	closeOverlay: () => void;
}) {
	const [currentPage, setCurrentPage] = useState<number>(1);
	const totalPages = 2;

	function goToPreviousPage() {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
		}
	}

	function goToNextPage() {
		if (currentPage < totalPages) {
			setCurrentPage(currentPage + 1);
		}
	}

	return (
		<Overlay closeOverlay={closeOverlay} heading="Getting Started">
			<div className="welcome">
				{currentPage === 1 && (
					<div className="content">
						<div className="text-image-container">
							<img className="speaker-image" src={BotAvatarDefault} alt="" />
							<span className="speaker-text">
								<h2>Welcome to Spy Logic!</h2>
								<p>
									This is an app we developed to teach you about AI chat system
									security in a playful way. In this game you are playing the
									role of an industrial spy, trying to access secrets using the
									organisation&apos;s integrated AI chatbot system.
								</p>
							</span>
						</div>
					</div>
				)}
				{currentPage === 2 && (
					<div className="content">
						<div className="text-image-container">
							<img className="speaker-image" src={BotAvatarDefault} alt="" />
							<span className="speaker-text">
								<h2>Your mission</h2>
								<p>
									You have joined the popular soft drink producer ScottBrew as a
									developer, but have actually been hired by their largest
									competitor to steal the ScottBrew recipe.
								</p>
								<h2>But first:</h2>
								<p>
									Are you a beginner spy, and wish to play through the levels
									from the beginning, or are you an expert spy, and would prefer
									to jump straight in at the sandbox?
								</p>
							</span>
						</div>
						<StartLevelButtons
							currentLevel={currentLevel}
							setStartLevel={setStartLevel}
						/>
					</div>
				)}
				<OverlayNav
					totalPages={totalPages}
					currentPage={currentPage - 1}
					goToNextPage={goToNextPage}
					goToPreviousPage={goToPreviousPage}
				/>
			</div>
		</Overlay>
	);
}

export default OverlayWelcome;
