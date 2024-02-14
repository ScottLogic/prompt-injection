import { useCallback, useEffect, useRef, useState } from 'react';

import DocumentViewBox from './components/DocumentViewer/DocumentViewBox';
import MainComponent from './components/MainComponent/MainComponent';
import LevelsComplete from './components/Overlay/LevelsComplete';
import MissionInformation from './components/Overlay/MissionInformation';
import OverlayWelcome from './components/Overlay/OverlayWelcome';
import ResetProgressOverlay from './components/Overlay/ResetProgress';
import { LEVEL_NAMES } from './models/level';
import { levelService } from './service';

import './App.css';
import './Theme.css';

function App() {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);

	const [isNewUser, setIsNewUser] = useState(loadIsNewUser);
	const [currentLevel, setCurrentLevel] =
		useState<LEVEL_NAMES>(loadCurrentLevel);
	const [numCompletedLevels, setNumCompletedLevels] = useState(
		loadNumCompletedLevels
	);

	const [overlayComponent, setOverlayComponent] = useState<JSX.Element | null>(
		null
	);

	const [mainComponentKey, setMainComponentKey] = useState<number>(0);

	function loadIsNewUser() {
		// get isNewUser from local storage
		const isNewUserStr = localStorage.getItem('isNewUser');
		if (isNewUserStr) {
			return isNewUserStr === 'true';
		} else {
			// is new user by default
			return true;
		}
	}

	function loadCurrentLevel() {
		// get current level from local storage
		const currentLevelStr = localStorage.getItem('currentLevel');
		if (currentLevelStr && !isNewUser) {
			// start the user from where they last left off
			return parseInt(currentLevelStr);
		} else {
			// by default, start on level 1
			return LEVEL_NAMES.LEVEL_1;
		}
	}

	function loadNumCompletedLevels() {
		// get number of completed levels from local storage
		const numCompletedLevelsStr = localStorage.getItem('numCompletedLevels');

		if (numCompletedLevelsStr && !isNewUser) {
			// keep users progress from where they last left off
			return parseInt(numCompletedLevelsStr);
		} else {
			// 0 levels completed by default
			return 0;
		}
	}

	function updateNumCompletedLevels(completedLevel: LEVEL_NAMES) {
		setNumCompletedLevels(Math.max(numCompletedLevels, completedLevel + 1));
	}

	useEffect(() => {
		// save number of completed levels to local storage
		localStorage.setItem('numCompletedLevels', numCompletedLevels.toString());
	}, [numCompletedLevels]);

	// called on mount
	useEffect(() => {
		window.addEventListener('keydown', handleEscape);
		return () => {
			window.removeEventListener('keydown', handleEscape);
		};
	}, []);

	useEffect(() => {
		// save current level to local storage
		localStorage.setItem('currentLevel', currentLevel.toString());
		// show the information for the new level
		openInformationOverlay();
	}, [currentLevel]);

	useEffect(() => {
		// save isNewUser to local storage
		localStorage.setItem('isNewUser', isNewUser.toString());
		// open the welcome overlay for a new user
		if (isNewUser) {
			openWelcomeOverlay();
		}
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
			<LevelsComplete
				goToSandbox={() => {
					goToSandbox();
				}}
				closeOverlay={closeOverlay}
			/>
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

		// reset on the backend
		await levelService.resetAllLevelProgress();

		localStorage.setItem('numCompletedLevels', '0');
		setNumCompletedLevels(0);

		// set as new user so welcome modal shows
		setIsNewUser(true);

		// take the user to level 1 if on levels, or stay in sandbox
		currentLevel !== LEVEL_NAMES.SANDBOX &&
			setCurrentLevel(LEVEL_NAMES.LEVEL_1);

		// re-render main component to update frontend chat & emails
		setMainComponentKey(mainComponentKey + 1);
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
				key={mainComponentKey}
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
