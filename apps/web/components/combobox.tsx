"use client";

import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import styles from "./combobox.module.css";

export type ComboboxOption = {
  value: string;
  label: string;
};

type ComboboxProps = {
  /** Rótulo acessível do campo. */
  label: string;
  /** Opções disponíveis (filtradas pelo pai em tempo real). */
  options: ComboboxOption[];
  /** Valor selecionado (value, não label). */
  value: string;
  /** Callback ao selecionar uma opção ou digitar texto livre (escape hatch). */
  onChange: (value: string) => void;
  /** Texto livre atual (o que está no input). Controlado pelo pai. */
  inputValue: string;
  /** Callback ao digitar (atualiza o filtro no pai). */
  onInputChange: (text: string) => void;
  /** Placeholder do input. */
  placeholder?: string;
  /** Desabilita o campo. */
  disabled?: boolean;
  /** Texto do escape hatch "minha opção não está na lista". */
  escapeLabel?: string;
};

/**
 * Combobox com busca/typeahead para país e cidade de origem no onboarding (#215).
 *
 * Controlado: pai detém `value` (valor selecionado) e `inputValue` (texto digitado),
 * permitindo filtrar as opções externamente. Escape hatch obrigatório: quando nenhuma
 * opção casar, aparece "não encontrei → usar texto digitado" para nunca travar.
 */
export function Combobox({
  label,
  options,
  value,
  onChange,
  inputValue,
  onInputChange,
  placeholder = "Digite para buscar",
  disabled = false,
  escapeLabel = "Minha opção não está na lista — usar o que digitei",
}: ComboboxProps) {
  const id = useId();
  const listId = `${id}-list`;
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const showEscape = open && inputValue.trim() && options.length === 0;

  useEffect(() => {
    if (!open) setActiveIndex(-1);
  }, [open]);

  function selectOption(opt: ComboboxOption) {
    onChange(opt.value);
    onInputChange(opt.label);
    setOpen(false);
  }

  function selectFreeText() {
    onChange(inputValue.trim());
    setOpen(false);
  }

  function handleInputChange(text: string) {
    onInputChange(text);
    onChange("");
    setOpen(true);
    setActiveIndex(-1);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const itemCount = options.length + (showEscape ? 1 : 0);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, itemCount - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (activeIndex >= 0 && activeIndex < options.length) {
        selectOption(options[activeIndex]);
      } else if (activeIndex === options.length && showEscape) {
        selectFreeText();
      }
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.field}>
        <input
          id={id}
          ref={inputRef}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={activeIndex >= 0 ? `${id}-opt-${activeIndex}` : undefined}
          className={styles.input}
          value={inputValue}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={handleKeyDown}
        />
        {value ? (
          <span className={styles.tick} aria-hidden="true">
            ✓
          </span>
        ) : null}
      </div>
      {open && (options.length > 0 || showEscape) ? (
        <ul id={listId} ref={listRef} role="listbox" aria-label={label} className={styles.list}>
          {options.map((opt, i) => (
            <li
              key={opt.value}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={opt.value === value}
              className={`${styles.item} ${i === activeIndex ? styles.active : ""}`}
              onMouseDown={() => selectOption(opt)}
            >
              {opt.label}
            </li>
          ))}
          {showEscape ? (
            <li
              id={`${id}-opt-${options.length}`}
              role="option"
              aria-selected={false}
              className={`${styles.item} ${styles.escape} ${activeIndex === options.length ? styles.active : ""}`}
              onMouseDown={selectFreeText}
            >
              {escapeLabel}
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
