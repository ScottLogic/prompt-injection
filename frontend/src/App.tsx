import "./App.css";
import "./Theme.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { LEVEL_NAMES } from "./models/level";
import { OVERLAY_TYPE } from "./models/overlay";
import OverlayWelcome from "./components/Overlay/OverlayWelcome";
import MissionInformation from "./components/Overlay/MissionInformation";
import HandbookOverlay from "./components/HandbookOverlay/HandbookOverlay";
import LevelsComplete from "./components/Overlay/LevelsComplete";
import MainComponent from "./components/MainComponent/MainComponent";
import DocumentViewBox from "./components/DocumentViewer/DocumentViewBox";

function App() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [isNewUser, setIsNewUser] = useState(loadIsNewUser);
  const [currentLevel, setCurrentLevel] =
    useState<LEVEL_NAMES>(loadCurrentLevel);

  const [overlayType, setOverlayType] = useState<OVERLAY_TYPE | null>(null);
  const [overlayComponent, setOverlayComponent] = useState<JSX.Element | null>(
    null
  );

  function loadIsNewUser() {
    // get isNewUser from local storage
    const isNewUserStr = localStorage.getItem("isNewUser");
    if (isNewUserStr) {
      return isNewUserStr === "true";
    } else {
      // is new user by default
      return true;
    }
  }

  function loadCurrentLevel() {
    // get current level from local storage
    const currentLevelStr = localStorage.getItem("currentLevel");
    if (currentLevelStr && !isNewUser) {
      // start the user from where they last left off
      return parseInt(currentLevelStr);
    } else {
      // by default, start on level 1
      return LEVEL_NAMES.LEVEL_1;
    }
  }

  // called on mount
  useEffect(() => {
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    // save current level to local storage
    localStorage.setItem("currentLevel", currentLevel.toString());
    // show the information for the new level
    openInformationOverlay();
  }, [currentLevel]);

  useEffect(() => {
    // save isNewUser to local storage
    localStorage.setItem("isNewUser", isNewUser.toString());
    // open the welcome overlay for a new user
    if (isNewUser) {
      openWelcomeOverlay();
    }
  }, [isNewUser]);

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
      case OVERLAY_TYPE.DOCUMENTS:
        setOverlayComponent(
          <DocumentViewBox
            closeOverlay={closeOverlay}
          />
        );
        break;
      default:
        setOverlayComponent(null);
    }

    // must re-bind event listener after changing overlay type
    setTimeout(() => {
      // Need timeout, else dialog consumes same click that
      // opened it and closes immediately!
      window.addEventListener("click", handleOverlayClick);
    });
    return () => {
      window.removeEventListener("click", handleOverlayClick);
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
      event.code === "Escape" && closeOverlay();
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
    setOverlayType(OVERLAY_TYPE.DOCUMENTS)
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
        <div ref={contentRef} className="content">
          {overlayComponent}
        </div>
      </dialog>
      <MainComponent
        currentLevel={currentLevel}
        isNewUser={isNewUser}
        openHandbook={openHandbook}
        openInformationOverlay={openInformationOverlay}
        openLevelsCompleteOverlay={openLevelsCompleteOverlay}
        openWelcomeOverlay={openWelcomeOverlay}
        setCurrentLevel={setCurrentLevel}
      />
    </div>
  );
}

export default App;
