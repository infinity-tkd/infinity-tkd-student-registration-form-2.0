import { CaretDown, WarningCircle } from "@phosphor-icons/react";

export default function FormField({
  id,
  label,
  hint,
  error,
  required,
  optional,
  icon: Icon,
  children,
  className = "",
}) {
  return (
    <div className={`form-field ${error ? "has-error" : ""} ${className}`}>
      <label className="field-label" htmlFor={id}>
        <span>
          {label.replace(/\s*\*$/, "")}
          {required && (
            <span className="required-mark" aria-hidden="true">
              {" "}
              *
            </span>
          )}
        </span>
        {!required && optional && (
          <span className="optional-label">{optional}</span>
        )}
      </label>
      <div className={`field-control ${Icon ? "with-icon" : ""}`}>
        {Icon && <Icon className="field-icon" size={19} aria-hidden="true" />}
        {children}
        {children?.type === "select" && (
          <CaretDown className="select-caret" size={15} aria-hidden="true" />
        )}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="field-error" role="alert">
          <WarningCircle size={15} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
