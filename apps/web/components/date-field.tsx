"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { Icon } from "@/components/atlas";

interface Props {
  /** Valor canônico em ISO `yyyy-mm-dd` (ou string vazia). */
  value: string;
  /** Recebe o novo valor em ISO `yyyy-mm-dd`, ou "" quando incompleto/limpo. */
  onChange: (iso: string) => void;
  min?: string;
  max?: string;
  id?: string;
  ariaLabel?: string;
}

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

function isoToDisplay(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return "";
  return `${d}/${m}/${y}`;
}

/** Mascara dígitos crus como DD/MM/YYYY conforme o usuário digita. */
function maskDigits(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  const dd = digits.slice(0, 2);
  const mm = digits.slice(2, 4);
  const yyyy = digits.slice(4, 8);
  let out = dd;
  if (digits.length >= 2) out += `/${mm}`;
  if (digits.length >= 4) out += `/${yyyy}`;
  return out;
}

/** Converte DD/MM/YYYY → ISO `yyyy-mm-dd` se for uma data real; senão `null`. */
function displayToIso(text: string): string | null {
  const match = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return `${yyyy}-${mm}-${dd}`;
}

function toIso(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function DateField({ value, onChange, min, max, id, ariaLabel }: Props) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const [text, setText] = useState(() => isoToDisplay(value));
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Sincroniza o display quando o valor canônico muda por fora (ex.: reset).
  useEffect(() => {
    setText(isoToDisplay(value));
  }, [value]);

  // Mês exibido no calendário: deriva do valor atual ou de hoje.
  const [view, setView] = useState(() => {
    const base = value ? new Date(`${value}T00:00:00`) : new Date();
    return { year: base.getFullYear(), month: base.getMonth() };
  });
  useEffect(() => {
    if (open && value) {
      const base = new Date(`${value}T00:00:00`);
      setView({ year: base.getFullYear(), month: base.getMonth() });
    }
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const grid = useMemo(() => {
    const first = new Date(view.year, view.month, 1);
    const startDow = first.getDay();
    const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
    const cells: ({ day: number; iso: string; disabled: boolean } | null)[] = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      const iso = toIso(view.year, view.month, day);
      const disabled = (min ? iso < min : false) || (max ? iso > max : false);
      cells.push({ day, iso, disabled });
    }
    return cells;
  }, [view, min, max]);

  function handleInput(raw: string) {
    const masked = maskDigits(raw);
    setText(masked);
    if (masked === "") {
      onChange("");
      return;
    }
    const iso = displayToIso(masked);
    if (iso && (!min || iso >= min) && (!max || iso <= max)) onChange(iso);
    else if (iso === null) onChange("");
  }

  function selectDay(iso: string) {
    setText(isoToDisplay(iso));
    onChange(iso);
    setOpen(false);
  }

  function shiftMonth(delta: number) {
    setView((v) => {
      const m = v.month + delta;
      return { year: v.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 };
    });
  }

  return (
    <div className="date-field" ref={wrapRef}>
      <input
        aria-label={ariaLabel}
        autoComplete="off"
        className="date-field-input"
        id={fieldId}
        inputMode="numeric"
        onChange={(e) => handleInput(e.target.value)}
        placeholder="DD/MM/AAAA"
        value={text}
      />
      <button
        aria-label="Abrir calendário"
        className="date-field-btn"
        onClick={() => setOpen((o) => !o)}
        type="button"
      >
        <Icon name="calendar" size={15} />
      </button>

      {open && (
        <div className="cal-popover" role="dialog">
          <div className="cal-head">
            <button aria-label="Mês anterior" onClick={() => shiftMonth(-1)} type="button">
              ‹
            </button>
            <span className="cal-title">
              {MONTHS[view.month]} {view.year}
            </span>
            <button aria-label="Próximo mês" onClick={() => shiftMonth(1)} type="button">
              ›
            </button>
          </div>
          <div className="cal-grid">
            {WEEKDAYS.map((d) => (
              <span className="cal-dow" key={d}>
                {d}
              </span>
            ))}
            {grid.map((cell, i) =>
              cell ? (
                <button
                  className={`cal-day${cell.iso === value ? " on" : ""}`}
                  disabled={cell.disabled}
                  key={cell.iso}
                  onClick={() => selectDay(cell.iso)}
                  type="button"
                >
                  {cell.day}
                </button>
              ) : (
                // biome-ignore lint/suspicious/noArrayIndexKey: leading blank cells are positional
                <span key={`blank-${i}`} />
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
