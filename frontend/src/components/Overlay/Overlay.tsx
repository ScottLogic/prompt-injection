import { ReactNode, useCallback, useEffect, useRef } from "react";
import "./Overlay.css";

function Overlay({
  children,
  closeOverlay,
}: {
  children: ReactNode;
  closeOverlay: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleOverlayClick = useCallback(
    (event: MouseEvent) => {
      contentRef.current &&
        !event.composedPath().includes(contentRef.current) &&
        closeOverlay();
    },
    [closeOverlay, contentRef]
  );

  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      event.code === "Escape" && closeOverlay();
    },
    [closeOverlay]
  );

  useEffect(() => {
    dialogRef.current?.showModal();
    return () => {
      dialogRef.current?.close();
    };
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleEscape);
    setTimeout(() => {
      // Need timeout, else dialog consumes same click that
      // opened it and closes immediately!
      window.addEventListener("click", handleOverlayClick);
    });

    return () => {
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("click", handleOverlayClick);
    };
  }, []);

  return (
    <dialog ref={dialogRef} className="overlay">
      <button
        className="prompt-injection-min-button close-button"
        onClick={closeOverlay}
        aria-label="close handbook overlay"
      >
        X
      </button>

      <div ref={contentRef} className="overlay-content">
        {children}
      </div>
    </dialog>
  );
}

export default Overlay;
