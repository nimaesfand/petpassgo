"use client";
import { useMemo, useRef, useState } from "react";
import { suggestBreeds, isKnownBreed } from "../lib/breeds";
import { tokens, font } from "../lib/theme";

// Breed box with suggestions that forgive spelling ("daachound" -> Dachshund). Any text is still allowed.
export default function BreedInput({ value, onChange, animal = "Dog", style, className = "", ...props }) {
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const blurTimer = useRef(null);
  const list = useMemo(() => (open ? suggestBreeds(value, animal, 6) : []), [value, animal, open]);
  const exact = isKnownBreed(value, animal);
  const show = open && list.length > 0 && !(exact && list.length === 1);

  function pick(b) {
    onChange({ target: { value: b } });
    setOpen(false);
  }

  return (
    <div className="relative w-full">
      <input {...props} value={value} autoComplete="off" autoCorrect="off" spellCheck={false} role="combobox" aria-expanded={show} aria-autocomplete="list"
        onChange={(e) => { onChange(e); setOpen(true); setHi(0); }}
        onFocus={() => setOpen(true)}
        onBlur={() => { blurTimer.current = setTimeout(() => setOpen(false), 150); }}
        onKeyDown={(e) => {
          if (!show) return;
          if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(h + 1, list.length - 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); }
          else if (e.key === "Enter") { e.preventDefault(); pick(list[hi]); }
          else if (e.key === "Escape") setOpen(false);
        }}
        className={`${className} w-full`} style={style} />
      {show && (
        <ul role="listbox" className="absolute left-0 right-0 mt-1 rounded-2xl overflow-hidden" style={{ zIndex: 50, background: "#fff", border: `1px solid ${tokens.line}`, boxShadow: "0 14px 34px rgba(20,33,61,.16)", listStyle: "none", padding: 4, margin: 0 }}>
          {list.map((b, i) => (
            <li key={b} role="option" aria-selected={i === hi}>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { clearTimeout(blurTimer.current); pick(b); }}
                className="w-full text-left rounded-xl px-3 py-2.5" style={{ background: i === hi ? tokens.sky : "transparent", border: "none", cursor: "pointer", fontFamily: font.body, fontSize: 16, fontWeight: 600, color: tokens.navy }}>
                {b}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
