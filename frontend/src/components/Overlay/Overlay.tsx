import { ReactNode } from "react";

import "./Overlay.css";

function Overlay({
  children,
  closeOverlay,
}: {
  children: ReactNode;
  closeOverlay: () => void;
}) {
  return (
    <div className="overlay">
      <button
        className="prompt-injection-min-button close-button"
        onClick={closeOverlay}
        aria-label="close overlay"
      >
        X
      </button>

      <div className="overlay-content">{children}</div>
    </div>
  );
}

export default Overlay;
