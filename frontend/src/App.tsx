import { useCallback, useEffect, useRef, useState } from 'react';

import DocumentViewBox from './components/DocumentViewer/DocumentViewBox';
import HandbookOverlay from './components/HandbookOverlay/HandbookOverlay';
import MainComponent from './components/MainComponent/MainComponent';
import LevelsComplete from './components/Overlay/LevelsComplete';
import MissionInformation from './components/Overlay/MissionInformation';
import OverlayWelcome from './components/Overlay/OverlayWelcome';
import ResetProgressOverlay from './components/Overlay/ResetProgress';
import { LEVEL_NAMES, LevelSystemRole } from './models/level';
import { OVERLAY_TYPE } from './models/overlay';
import { resetAllLevelProgress } from './service/levelService';
import { getSystemRoles } from './service/systemRoleService';

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
	const [overlayType, setOverlayType] = useState<OVERLAY_TYPE | null>(null);
	const [overlayComponent, setOverlayComponent] = useState<JSX.Element | null>(
		null
	);
	const [systemRoles, setSystemRoles] = useState<LevelSystemRole[]>([]);
	const [hasReset, setHasReset] = useState(false);

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

	function incrementNumCompletedLevels(completedLevel: LEVEL_NAMES) {
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
		// load the system roles
		getSystemRoles()
			.then((roles) => {
				setSystemRoles(roles);
			})
			.catch((err) => {
				console.log(err);
			});
	}, []);

	useEffect(() => {
		if (overlayType === null) {
			dialogRef.current?.close();
		} else {
			dialogRef.current?.showModal();
		}

		switch (overlayType) {
			case OVERLAY_TYPE.WELCOME:
				setOverlayComponent(
					<OverlayWelcome
						currentLevel={currentLevel}
						setStartLevel={(level: LEVEL_NAMES) => {
							setStartLevel(level);
						}}
						closeOverlay={closeOverlay}
					/>
				);
				break;
			case OVERLAY_TYPE.INFORMATION:
				setOverlayComponent(
					<MissionInformation
						currentLevel={currentLevel}
						closeOverlay={closeOverlay}
					/>
				);
				break;
			case OVERLAY_TYPE.HANDBOOK:
				setOverlayComponent(
					<HandbookOverlay
						currentLevel={currentLevel}
						numCompletedLevels={numCompletedLevels}
						systemRoles={systemRoles}
						closeOverlay={closeOverlay}
					/>
				);
				break;
			case OVERLAY_TYPE.LEVELS_COMPLETE:
				setOverlayComponent(
					<LevelsComplete
						goToSandbox={() => {
							goToSandbox();
						}}
						closeOverlay={closeOverlay}
					/>
				);
				break;
			case OVERLAY_TYPE.RESET_PROGRESS:
				setOverlayComponent(
					<ResetProgressOverlay
						resetProgress={resetProgress}
						closeOverlay={closeOverlay}
					/>
				);
				break;
			case OVERLAY_TYPE.DOCUMENTS:
				setOverlayComponent(<DocumentViewBox closeOverlay={closeOverlay} />);
				break;
			default:
				setOverlayComponent(null);
		}

		// must re-bind event listener after changing overlay type
		setTimeout(() => {
			// Need timeout, else dialog consumes same click that
			// opened it and closes immediately!
			window.addEventListener('click', handleOverlayClick);
		});
		return () => {
			window.removeEventListener('click', handleOverlayClick);
		};
	}, [overlayType]);

	const handleOverlayClick = useCallback(
		(event: MouseEvent) => {
			overlayType !== null &&
				contentRef.current &&
				!event.composedPath().includes(contentRef.current) &&
				closeOverlay();
		},
		[closeOverlay, contentRef, overlayType]
	);

	const handleEscape = useCallback(
		(event: KeyboardEvent) => {
			event.code === 'Escape' && closeOverlay();
		},
		[closeOverlay]
	);

	function closeOverlay() {
		// open the mission info after welcome page for a new user
		if (overlayType === OVERLAY_TYPE.WELCOME) {
			setIsNewUser(false);
			openInformationOverlay();
		} else {
			setOverlayType(null);
		}
	}

	function openWelcomeOverlay() {
		setOverlayType(OVERLAY_TYPE.WELCOME);
	}
	function openHandbook() {
		setOverlayType(OVERLAY_TYPE.HANDBOOK);
	}
	function openInformationOverlay() {
		setOverlayType(OVERLAY_TYPE.INFORMATION);
	}
	function openLevelsCompleteOverlay() {
		setOverlayType(OVERLAY_TYPE.LEVELS_COMPLETE);
	}
	function openDocumentViewer() {
		setOverlayType(OVERLAY_TYPE.DOCUMENTS);
	}
	function openResetProgressOverlay() {
		setOverlayType(OVERLAY_TYPE.RESET_PROGRESS);
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
		await resetAllLevelProgress();

		localStorage.setItem('numCompletedLevels', '0');
		setNumCompletedLevels(0);

		// set as new user so welcome modal shows
		setIsNewUser(true);

		// take the user to level 1 if on levels, or sandbox if on sandbox
		if (currentLevel !== LEVEL_NAMES.SANDBOX) {
			setCurrentLevel(LEVEL_NAMES.LEVEL_1);
		} else {
			setCurrentLevel(LEVEL_NAMES.SANDBOX);
		}

		// set has reset to true for 4 seconds
		setHasReset(true);
		setTimeout(() => {
			setHasReset(false);
		}, 4000);
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
				hasReset={hasReset}
				incrementNumCompletedLevels={incrementNumCompletedLevels}
				openHandbook={openHandbook}
				openInformationOverlay={openInformationOverlay}
				openLevelsCompleteOverlay={openLevelsCompleteOverlay}
				openWelcomeOverlay={openWelcomeOverlay}
				openResetProgressOverlay={openResetProgressOverlay}
				openDocumentViewer={openDocumentViewer}
				setCurrentLevel={setCurrentLevel}
			/>
		</div>
	);
}

export default App;
