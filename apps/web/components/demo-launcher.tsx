"use client";

import { useState } from "react";

import { Icon } from "./atlas";
import { DemoOverlay } from "./demo-overlay";

// Gatilho cliente do "Ver exemplo" da Home (#137). Mantém o estado de aberto e
// monta o DemoOverlay sob demanda. A Home segue server component: cada botão
// "Ver exemplo" (herói e banda CTA) vira uma instância deste launcher.
export function DemoLauncher({ label, className }: { label: string; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className={className} onClick={() => setOpen(true)} type="button">
        <Icon name="eye" size={15} />
        {label}
      </button>
      {open && <DemoOverlay onClose={() => setOpen(false)} />}
    </>
  );
}
