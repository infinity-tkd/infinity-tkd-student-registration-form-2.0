import { useEffect, useRef, useState } from "react";
import { CaretDown, Check, MagnifyingGlass } from "@phosphor-icons/react";
import { interfaceCopy } from "../data/interface";

export default function SearchableSelect({
  id,
  value,
  options = [],
  onChange,
  onBlur,
  disabled = false,
  required = false,
  lang = "en",
  getLabel = (option) => option,
  allowCustomValue = false,
  renderOption,
  error,
  describedBy,
  maxLength = 240,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(-1);
  const listRef = useRef(null);
  const copy = interfaceCopy[lang];
  const filtered = options.filter((option) =>
    `${option} ${getLabel(option)}`
      .toLocaleLowerCase()
      .includes(query.trim().toLocaleLowerCase()),
  );
  const custom =
    allowCustomValue &&
    query.trim() &&
    !options.some(
      (option) =>
        option.toLocaleLowerCase() === query.trim().toLocaleLowerCase() ||
        getLabel(option).toLocaleLowerCase() ===
          query.trim().toLocaleLowerCase(),
    );
  const items = custom ? [query.trim(), ...filtered] : filtered;
  const choose = (option) => {
    onChange(option);
    setOpen(false);
    setQuery("");
    setActive(-1);
  };
  useEffect(() => {
    const list = listRef.current;
    const option = list?.querySelector(`[data-index="${active}"]`);
    if (!open || !option) return;
    const listRect = list.getBoundingClientRect();
    const optionRect = option.getBoundingClientRect();
    if (optionRect.top < listRect.top)
      list.scrollTop += optionRect.top - listRect.top;
    else if (optionRect.bottom > listRect.bottom)
      list.scrollTop += optionRect.bottom - listRect.bottom;
  }, [open, active]);
  return (
    <div
      className={`combobox ${open && !disabled ? "is-open" : ""}`}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          if (allowCustomValue && open && query.trim()) {
            const exact = options.find(
              (option) =>
                option.toLocaleLowerCase() ===
                  query.trim().toLocaleLowerCase() ||
                getLabel(option).toLocaleLowerCase() ===
                  query.trim().toLocaleLowerCase(),
            );
            onChange(exact || query.trim());
          }
          setOpen(false);
          setQuery("");
          setActive(-1);
          onBlur?.(event);
        }
      }}
    >
      <input
        id={id}
        name={id}
        role="combobox"
        type="text"
        className="form-input combobox-input"
        value={open && !disabled ? query : value ? getLabel(value) : ""}
        placeholder={open ? copy.search : copy.select}
        disabled={disabled}
        autoComplete="off"
        maxLength={maxLength}
        aria-autocomplete="list"
        aria-expanded={open && !disabled}
        aria-controls={open && !disabled ? `${id}-listbox` : undefined}
        aria-activedescendant={
          open && active >= 0 && items[active]
            ? `${id}-option-${active}`
            : undefined
        }
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        onFocus={() => {
          setOpen(true);
          setQuery("");
          setActive(-1);
        }}
        onClick={() => {
          if (!open) {
            setOpen(true);
            setQuery("");
            setActive(-1);
          }
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(-1);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            if (open) event.stopPropagation();
            setOpen(false);
            setQuery("");
            setActive(-1);
          }
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
            if (items.length)
              setActive((index) =>
                event.key === "ArrowDown"
                  ? (index + 1) % items.length
                  : index <= 0
                    ? items.length - 1
                    : index - 1,
              );
          }
          if (event.key === "Enter" && open) {
            event.preventDefault();
            if (items[active]) choose(items[active]);
            else if (items.length === 1 || custom) choose(items[0]);
          }
        }}
      />
      <CaretDown className="select-caret" size={15} aria-hidden="true" />
      {open && !disabled && (
        <div className="select-menu">
          <div className="select-search-hint">
            <MagnifyingGlass size={14} aria-hidden="true" />
            {copy.search}
          </div>
          <ul
            ref={listRef}
            id={`${id}-listbox`}
            role="listbox"
            aria-label={copy.select}
          >
            {items.map((option, index) => (
              <li
                key={option}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={value === option}
                data-index={index}
                className={`select-option ${active === index ? "highlighted" : ""} ${value === option ? "selected" : ""}`}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => choose(option)}
                onPointerMove={() => setActive(index)}
              >
                <span>
                  {custom && index === 0
                    ? `${copy.custom} “${option}”`
                    : renderOption
                      ? renderOption(option)
                      : getLabel(option)}
                </span>
                {value === option && (
                  <Check size={17} weight="bold" aria-hidden="true" />
                )}
              </li>
            ))}
            {!items.length && (
              <li className="select-empty" role="presentation">
                {copy.noResults}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
