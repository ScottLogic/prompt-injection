import Overlay from "./Overlay";
import "./OverlayWelcome.css";

function OverlayWelcome({ closeOverlay }: { closeOverlay: () => void }) {
  return (
    <Overlay closeOverlay={closeOverlay}>
      <div className="welcome">
        <h1>Welcome!</h1>
        <p>
          Your mission, should you choose to accept it, is to go undercover and
          spy on a rival company. Find out what they are doing, and email me the
          details.
        </p>
      </div>
    </Overlay>
  );
}

export default OverlayWelcome;
