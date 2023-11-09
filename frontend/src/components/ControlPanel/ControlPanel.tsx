import "./ControlPanel.css";
import {
  DEFENCE_TYPES,
  DefenceConfig,
  DefenceInfo,
} from "../../models/defence";
import { LEVEL_NAMES } from "../../models/level";
import DefenceBox from "../DefenceBox/DefenceBox";
import ModelBox from "../ModelBox/ModelBox";
import DocumentViewButton from "../DocumentViewer/DocumentViewButton";
import SwitchModeButton from "../ThemedButtons/SwitchModeButton";

function ControlPanel({
  currentLevel,
  defences,
  setDefenceActive,
  setDefenceInactive,
  setDefenceConfiguration,
  openWelcomeOverlay,
  openDocumentViewer,
  closeDocumentViewer,
}: {
  currentLevel: LEVEL_NAMES;
  defences: DefenceInfo[];
  setDefenceActive: (defence: DefenceInfo) => void;
  setDefenceInactive: (defence: DefenceInfo) => void;
  setDefenceConfiguration: (
    defenceId: DEFENCE_TYPES,
    config: DefenceConfig[]
  ) => Promise<boolean>;
  openWelcomeOverlay: () => void;
  openDocumentViewer: () => void;
  closeDocumentViewer: () => void;
}) {
  function getDefencesConfigure() {
    return defences.filter((defence) => {
      return ![
        DEFENCE_TYPES.EVALUATION_LLM_INSTRUCTIONS,
        DEFENCE_TYPES.QA_LLM_INSTRUCTIONS,
        DEFENCE_TYPES.SYSTEM_ROLE,
      ].some((id) => id === defence.id);
    });
  }

  function getDefencesModel() {
    return defences.filter((defence) => {
      return [
        DEFENCE_TYPES.EVALUATION_LLM_INSTRUCTIONS,
        DEFENCE_TYPES.QA_LLM_INSTRUCTIONS,
        DEFENCE_TYPES.SYSTEM_ROLE,
      ].some((id) => id === defence.id);
    });
  }

  // only allow configuration in sandbox
  const showConfigurations = currentLevel === LEVEL_NAMES.SANDBOX;

  return (
    <div className="control-panel">
      {/* only show control panel on level 3 and sandbox */}
      {(currentLevel === LEVEL_NAMES.LEVEL_3 ||
        currentLevel === LEVEL_NAMES.SANDBOX) && (
        <>
          <details className="control-collapsible-section">
            <summary className="control-collapsible-section-header">
              Defence Configuration
            </summary>
            <DefenceBox
              currentLevel={currentLevel}
              defences={getDefencesConfigure()}
              showConfigurations={showConfigurations}
              setDefenceActive={setDefenceActive}
              setDefenceInactive={setDefenceInactive}
              setDefenceConfiguration={setDefenceConfiguration}
            />
          </details>

          <details className="control-collapsible-section">
            <summary className="control-collapsible-section-header">
              Model Configuration
            </summary>
            <DefenceBox
              currentLevel={currentLevel}
              defences={getDefencesModel()}
              showConfigurations={showConfigurations}
              setDefenceActive={setDefenceActive}
              setDefenceInactive={setDefenceInactive}
              setDefenceConfiguration={setDefenceConfiguration}
            />

            {/* only show model box in sandbox mode */}
            {showConfigurations && <ModelBox />}
          </details>
        </>
      )}

      {/* only show document viewer button in sandbox mode */}
      {currentLevel === LEVEL_NAMES.SANDBOX && 
      <DocumentViewButton 
        closeOverlay={closeDocumentViewer}
        openOverlay={openDocumentViewer}
      />}
      <SwitchModeButton
        currentLevel={currentLevel}
        onClick={() => {
          openWelcomeOverlay();
        }}
      />
    </div>
  );
}

export default ControlPanel;
