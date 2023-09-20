import "./HandbookOverlay.css";

function HandbookOverlay({ closeOverlay }: { closeOverlay: () => void }) {
  return (
    <div id="handbook-overlay-screen" onClick={closeOverlay}>
      <div
        id="handbook-overlay"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <div id="handbook-overlay-content">
          <h1>Welcome!</h1>
          <p>
            Your mission, should you choose to accept it, is to go undercover
            and spy on a rival company. Find out what they are doing, and email
            me the details.
          </p>
        </div>
      </div>
    </div>
  );
}

export default HandbookOverlay;
