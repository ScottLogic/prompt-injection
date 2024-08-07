import { useCallback, useEffect, useRef, useState, JSX } from 'react';

import MainComponent from './components/MainComponent/MainComponent';
import LevelsComplete from './components/Overlay/LevelsComplete';
import MissionInformation from './components/Overlay/MissionInformation';
import OverlayWelcome from './components/Overlay/OverlayWelcome';
import useLocalStorage from './hooks/useLocalStorage';
import { LEVEL_NAMES } from './models/level';

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
		isNewUser && openWelcomeOverlay();
	}, [isNewUser]);

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
		// Some of our dialogs open directly after others, and showModal()
		// throws error if the dialog is already open, so this check is vital!
		dialogRef.current?.open === false && dialogRef.current.showModal();
	}

	function openWelcomeOverlay() {
		setIsNewUser(false);
		openOverlay(
			<OverlayWelcome
				setStartLevel={(level: LEVEL_NAMES) => {
					setStartLevel(level);
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
			<LevelsComplete
				goToSandbox={() => {
					setCurrentLevel(LEVEL_NAMES.SANDBOX);
				}}
				closeOverlay={closeOverlay}
			/>
		);
	}

	// set the start level for a user who clicks beginner/expert
	function setStartLevel(startLevel: LEVEL_NAMES) {
		if (currentLevel !== startLevel) {
			// Changing level triggers info overlay: wait for that to avoid flash-of-wrong-level
			setCurrentLevel(startLevel);
		} else {
			// Same level will not trigger info overlay, so must open manually
			openInformationOverlay();
		}
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
				openOverlay={openOverlay}
				openInformationOverlay={openInformationOverlay}
				openLevelsCompleteOverlay={openLevelsCompleteOverlay}
				openWelcomeOverlay={openWelcomeOverlay}
				setCurrentLevel={setCurrentLevel}
				resetCompletedLevels={resetCompletedLevels}
				setIsNewUser={setIsNewUser}
			/>
		</div>
	);
}

export default App;
