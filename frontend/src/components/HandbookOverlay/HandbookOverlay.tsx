import "./HandbookOverlay.css";

function HandbookOverlay({ closeOverlay }: { closeOverlay: () => void }) {
  return (
    <div id="handbook-overlay" onClick={closeOverlay}>
      <div
        id="handbook-overlay-content"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <h1>Welcome!</h1>
        <p>Coming soon!</p>
      </div>
    </div>
  );
}

export default HandbookOverlay;
