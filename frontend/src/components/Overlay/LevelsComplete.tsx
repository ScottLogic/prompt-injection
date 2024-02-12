import { useState } from 'react';

import LevelsCompleteButtons from '@src/components/ThemedButtons/LevelsCompleteButtons';

import Overlay from './Overlay';
import OverlayNav from './OverlayNav';

import './LevelsComplete.css'

function LevelsComplete({
	goToSandbox,
	closeOverlay,
}: {
	goToSandbox: () => void;
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
		<Overlay closeOverlay={closeOverlay} heading="Congratulations!">
			{currentPage === 1 && (
				<div className="content">
					<h2>ScottBrew Manager:</h2>
					<p>Congratulations on becoming our new Head of Security! You can now fully explore and adjust ScottBrewBot's system, defences, prompts and more. Glad to finally have you in the right role</p>
				</div>
			)}
			{currentPage === 2 && (
				<div className="content">
					<h2>You&apos;ve completed the story mode</h2>
					<p>
						You can stay here and continue
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
			)}
			<OverlayNav 
				totalPages={totalPages}
				currentPage={currentPage -1}
				goToNextPage={goToNextPage}
				goToPreviousPage={goToPreviousPage}
			/>
		</Overlay>
	);
}

export default LevelsComplete;
