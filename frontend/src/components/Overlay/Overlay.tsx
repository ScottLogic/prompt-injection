import {
  ForwardedRef,
  forwardRef,
  ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import "./Overlay.css";

export interface DialogClose {
  close: () => void;
}

const Overlay = forwardRef(function Overlay(
  {
    children,
    closeOverlay,
  }: {
    children: ReactNode;
    closeOverlay: () => void;
  },
  ref: ForwardedRef<DialogClose>
) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    close: () => dialogRef.current?.close(),
  }));

  function handleCloseOverlay() {
    dialogRef.current?.close();
    closeOverlay();
  }

  const handleOverlayClick = useCallback(
    (event: MouseEvent) => {
      contentRef.current &&
        !event.composedPath().includes(contentRef.current) &&
        handleCloseOverlay();
    },
    [handleCloseOverlay, contentRef]
  );

  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      event.code === "Escape" && handleCloseOverlay();
    },
    [handleCloseOverlay]
  );

  useEffect(() => {
    dialogRef.current?.showModal();

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
        onClick={handleCloseOverlay}
        aria-label="close handbook overlay"
      >
        X
      </button>

      <div ref={contentRef} className="overlay-content">
        {children}
      </div>
    </dialog>
  );
});

export default Overlay;
