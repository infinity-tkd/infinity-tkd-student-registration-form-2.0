import { useEffect, useRef } from "react";
import { X } from "@phosphor-icons/react";

export default function Modal({
  title,
  closeLabel,
  onClose,
  children,
  dismissible = true,
}) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    dialog.querySelector("#modal-title")?.focus({ preventScroll: true });
    dialog.scrollTop = 0;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={dialogRef}
      className="modal"
      aria-labelledby="modal-title"
      onCancel={(event) => {
        event.preventDefault();
        if (dismissible) onClose();
      }}
      onClick={(event) => {
        if (dismissible && event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h2 id="modal-title" tabIndex={-1}>
            {title}
          </h2>
          {dismissible && (
            <button
              type="button"
              className="icon-button"
              onClick={onClose}
              aria-label={closeLabel}
            >
              <X size={20} />
            </button>
          )}
        </div>
        {children}
      </div>
    </dialog>
  );
}
