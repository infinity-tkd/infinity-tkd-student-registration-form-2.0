import React, { useState, useEffect, useRef } from 'react';
import { CaretDown, CheckCircle, XCircle } from '@phosphor-icons/react';

export default function SearchableSelect({
  id,
  value,
  options = [],
  placeholder = 'Search...',
  placeholderKey = '',
  onChange,
  required = false,
  disabled = false,
  icon: IconComponent = null, // Phosphor icon component
  lang = 'en',
  i18n = {},
  isValid = null,
  showValidation = false,
  getLabel = (opt) => opt,
  allowCustomValue = false,
  renderOption = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const wrapperRef = useRef(null);
  const listContainerRef = useRef(null);

  // Translate placeholder
  let translatedPlaceholder = placeholder;
  if (placeholderKey && i18n[lang] && i18n[lang][placeholderKey]) {
    translatedPlaceholder = i18n[lang][placeholderKey];
  }

  // Update search term when value changes externally (e.g. reset or cascade) or language changes
  useEffect(() => {
    if (value) {
      setSearchTerm(getLabel(value));
    } else {
      setSearchTerm('');
    }
  }, [value, lang]);

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsFocused(false);
        if (allowCustomValue) {
          onChange(searchTerm);
        } else {
          setSearchTerm(value ? getLabel(value) : '');
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value, lang, searchTerm, allowCustomValue]);

  // Filter options based on search term
  const isMatchSelected = value && options.includes(value) && searchTerm === getLabel(value);
  const filteredOptions = options.filter(opt => {
    if (!searchTerm || isMatchSelected) return true;
    const label = getLabel(opt) || '';
    return opt.toLowerCase().includes(searchTerm.toLowerCase()) || 
           label.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const exactMatchExists = options.some(opt => getLabel(opt).toLowerCase() === searchTerm.toLowerCase());

  // Construct selectable items dynamically to unify keyboard indexes
  const selectableItems = [];
  const showCustomOption = allowCustomValue && searchTerm && !exactMatchExists;
  
  if (showCustomOption) {
    selectableItems.push({ type: 'custom', value: searchTerm });
  }
  
  filteredOptions.forEach(opt => {
    selectableItems.push({ type: 'option', value: opt });
  });

  // Reset highlight index when filter changes or dropdown opens/closes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchTerm, isOpen]);

  // Auto scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listContainerRef.current) {
      const container = listContainerRef.current;
      const activeEl = container.childNodes[highlightedIndex];
      if (activeEl) {
        const containerTop = container.scrollTop;
        const containerBottom = containerTop + container.clientHeight;
        const elemTop = activeEl.offsetTop;
        const elemBottom = elemTop + activeEl.clientHeight;

        if (elemTop < containerTop) {
          container.scrollTop = elemTop;
        } else if (elemBottom > containerBottom) {
          container.scrollTop = elemBottom - container.clientHeight;
        }
      }
    }
  }, [highlightedIndex]);

  const handleFocus = () => {
    if (disabled) return;
    setIsOpen(true);
    setIsFocused(true);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    if (allowCustomValue) {
      onChange(e.target.value);
    }
  };

  const handleSelectOption = (opt) => {
    onChange(opt);
    setSearchTerm(getLabel(opt));
    setIsOpen(false);
    setIsFocused(false);
  };

  const handleBlur = () => {
    // Timeout to allow mousedown on option list to fire first
    setTimeout(() => {
      if (wrapperRef.current && !wrapperRef.current.contains(document.activeElement)) {
        setIsOpen(false);
        setIsFocused(false);
        if (allowCustomValue) {
          onChange(searchTerm);
        } else {
          setSearchTerm(value ? getLabel(value) : '');
        }
      }
    }, 150);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < selectableItems.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev > 0 ? prev - 1 : selectableItems.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < selectableItems.length) {
        const item = selectableItems[highlightedIndex];
        handleSelectOption(item.value);
      } else if (allowCustomValue) {
        handleSelectOption(searchTerm);
      } else {
        setIsOpen(false);
        setIsFocused(false);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setIsFocused(false);
      setSearchTerm(value ? getLabel(value) : '');
    }
  };

  // Validation styling
  let borderClass = 'border-gray-200 dark:border-gray-800';
  if (showValidation) {
    if (isValid === true && value) {
      borderClass = 'border-gray-200 dark:border-gray-800';
    } else if (isValid === false) {
      borderClass = 'border-primary dark:border-primary';
    }
  }

  return (
    <div className={`relative w-full secure-input-group ${isOpen ? 'z-[60]' : 'z-10'}`} ref={wrapperRef}>
      {/* Left Icon */}
      {IconComponent && (
        <IconComponent
          className={`input-icon-left transition-colors duration-300 ${
            isFocused ? 'text-primary' : 'text-gray-400'
          }`}
          style={{ top: '50%', transform: 'translateY(-50%)' }}
        />
      )}

      {/* Input Box */}
      <input
        type="text"
        id={`${id}_search`}
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={translatedPlaceholder}
        disabled={disabled}
        className={`secure-input !pl-10 !pr-10 cursor-pointer border ${borderClass} ${
          disabled ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-900' : ''
        }`}
        autoComplete="off"
      />

      {/* Chevron dropdown indicator */}
      <CaretDown
        className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none transition-transform duration-200 ${
          isOpen ? 'rotate-180' : 'rotate-0'
        }`}
        size={18}
      />

      {/* Validation Icons */}
      {showValidation && (
        <>
          {isValid === true && value && (
            <CheckCircle
              className="validation-icon text-green-500 show"
              size={18}
              weight="fill"
            />
          )}
          {isValid === false && (
            <XCircle
              className="validation-icon text-primary show"
              size={18}
              weight="fill"
            />
          )}
        </>
      )}

      {/* Dropdown Container */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-cardDark border border-gray-200 dark:border-gray-700 rounded-custom shadow-lg flex flex-col">
          <ul 
            ref={listContainerRef} 
            className="list-none m-0 p-0 text-sm dark:text-white max-h-60 overflow-y-auto"
          >
            {selectableItems.length > 0 ? (
              selectableItems.map((item, index) => {
                const isSelected = value === item.value;
                const isHighlighted = highlightedIndex === index;
                
                if (item.type === 'custom') {
                  return (
                    <li
                      key="custom_option_item"
                      className={`p-3 cursor-pointer transition-colors text-left text-primary font-semibold border-b border-gray-100 dark:border-gray-800 flex items-center justify-between ${
                        isHighlighted ? 'bg-gray-100 dark:bg-gray-800' : ''
                      }`}
                      onMouseDown={() => handleSelectOption(item.value)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      <span>
                        {lang === 'km' 
                          ? `ប្រើប្រាស់ "${item.value}"` 
                          : lang === 'zh' 
                          ? `使用 "${item.value}"` 
                          : `Use "${item.value}"`}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded-custom font-bold">
                        {lang === 'km' ? 'ផ្ទាល់ខ្លួន' : lang === 'zh' ? '自定义' : 'Custom'}
                      </span>
                    </li>
                  );
                }
                
                return (
                  <li
                    key={item.value}
                    className={`p-3 cursor-pointer transition-colors text-left ${
                      isSelected 
                        ? 'bg-primary text-white' 
                        : isHighlighted 
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200' 
                        : 'text-gray-800 dark:text-gray-200'
                    }`}
                    onMouseDown={() => handleSelectOption(item.value)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    {renderOption ? renderOption(item.value, isSelected, isHighlighted) : getLabel(item.value)}
                  </li>
                );
              })
            ) : (
              <li className="p-3 text-gray-400 italic text-center">
                No results found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
