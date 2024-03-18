import { useCallback, useEffect, useRef, useState, JSX } from 'react';

import DocumentViewBox from './components/DocumentViewer/DocumentViewBox';
import MainComponent from './components/MainComponent/MainComponent';
import LevelsComplete from './components/Overlay/LevelsComplete';
import MissionInformation from './components/Overlay/MissionInformation';
import OverlayWelcome from './components/Overlay/OverlayWelcome';
import ResetProgressOverlay from './components/Overlay/ResetProgress';
import useLocalStorage from './hooks/useLocalStorage';
import { LEVEL_NAMES } from './models/level';
import { resetService } from './service';

import './App.css';
import './Theme.css';

function App() {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);

	const {
		isNewUser,
		setIsNewUser,
		currentLevel,
		setCurrentLevel,
		numCompletedLevels,
		setCompletedLevels,
		resetCompletedLevels,
	} = useLocalStorage();

	const [overlayComponent, setOverlayComponent] = useState<JSX.Element | null>(
		null
	);

	function updateNumCompletedLevels(completedLevel: LEVEL_NAMES) {
		setCompletedLevels(completedLevel + 1);
	}

	// called on mount
	useEffect(() => {
		window.addEventListener('keydown', handleEscape);
		return () => {
			window.removeEventListener('keydown', handleEscape);
		};
	}, []);

	useEffect(() => {
		openInformationOverlay();
	}, [currentLevel]);

	useEffect(() => {
		if (isNewUser) openWelcomeOverlay();
	}, [isNewUser]);

	useEffect(() => {
		// must re-bind event listener after changing overlay type
		setTimeout(() => {
			// Need timeout, else dialog consumes same click that
			// opened it and closes immediately!
			window.addEventListener('click', handleOverlayClick);
		});
		return () => {
			window.removeEventListener('click', handleOverlayClick);
		};
	}, [overlayComponent]);

	const handleOverlayClick = useCallback(
		(event: MouseEvent) => {
			if (
				overlayComponent !== null &&
				contentRef.current &&
				!event.composedPath().includes(contentRef.current)
			) {
				closeOverlay();
			}
		},
		[closeOverlay, contentRef, overlayComponent]
	);

	const handleEscape = useCallback(
		(event: KeyboardEvent) => {
			event.code === 'Escape' && closeOverlay();
		},
		[closeOverlay]
	);

	function closeOverlay() {
		dialogRef.current?.close();
		setOverlayComponent(null);
	}

	function openOverlay(overlay: JSX.Element) {
		setOverlayComponent(overlay);
		dialogRef.current?.showModal();
	}

	function openWelcomeOverlay() {
		openOverlay(
			<OverlayWelcome
				currentLevel={currentLevel}
				setStartLevel={(level: LEVEL_NAMES) => {
					setStartLevel(level);
					// after welcome overlay, open mission info overlay
					setIsNewUser(false);
					openInformationOverlay();
				}}
				closeOverlay={closeOverlay}
			/>
		);
	}

	function openInformationOverlay() {
		openOverlay(
			<MissionInformation
				currentLevel={currentLevel}
				closeOverlay={closeOverlay}
			/>
		);
	}
	function openLevelsCompleteOverlay() {
		openOverlay(
			<LevelsComplete goToSandbox={goToSandbox} closeOverlay={closeOverlay} />
		);
	}
	function openDocumentViewer() {
		openOverlay(<DocumentViewBox closeOverlay={closeOverlay} />);
	}
	function openResetProgressOverlay() {
		openOverlay(
			<ResetProgressOverlay
				resetProgress={resetProgress}
				closeOverlay={closeOverlay}
			/>
		);
	}

	// set the start level for a user who clicks beginner/expert
	function setStartLevel(startLevel: LEVEL_NAMES) {
		if (
			(startLevel === LEVEL_NAMES.LEVEL_1 &&
				currentLevel === LEVEL_NAMES.SANDBOX) ||
			(startLevel === LEVEL_NAMES.SANDBOX &&
				currentLevel !== LEVEL_NAMES.SANDBOX)
		) {
			console.log(`setting start level to ${startLevel} from ${currentLevel}`);

			setCurrentLevel(startLevel);
		}
		closeOverlay();
	}

	// resets whole game progress and start from level 1 or Sandbox
	async function resetProgress() {
		console.log('resetting progress for all levels');
		await resetService.resetAllLevelProgress(); //yeeeeeeeee
		resetCompletedLevels();

		// set as new user so welcome modal shows
		setIsNewUser(true);

		// take the user to level 1 if on levels, or stay in sandbox
		currentLevel !== LEVEL_NAMES.SANDBOX &&
			setCurrentLevel(LEVEL_NAMES.LEVEL_1);
	}

	function goToSandbox() {
		setStartLevel(LEVEL_NAMES.SANDBOX);
		// close the current overlay
		closeOverlay();
		// open the sandbox info overlay
		openInformationOverlay();
	}

	return (
		<div className="app-content">
			<dialog ref={dialogRef} className="dialog-modal">
				<div ref={contentRef}>{overlayComponent}</div>
			</dialog>
			<MainComponent
				currentLevel={currentLevel}
				numCompletedLevels={numCompletedLevels}
				closeOverlay={closeOverlay}
				updateNumCompletedLevels={updateNumCompletedLevels}
				openDocumentViewer={openDocumentViewer}
				openOverlay={openOverlay}
				openInformationOverlay={openInformationOverlay}
				openLevelsCompleteOverlay={openLevelsCompleteOverlay}
				openResetProgressOverlay={openResetProgressOverlay}
				openWelcomeOverlay={openWelcomeOverlay}
				setCurrentLevel={setCurrentLevel}
			/>
		</div>
	);
}

export default App;
