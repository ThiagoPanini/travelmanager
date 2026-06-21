import { BoardingPassRibbon } from "@/components/boarding-pass-ribbon";
import { StepCards } from "@/components/step-cards";
import { Wordmark } from "@/components/wordmark";
import { entrar, eyebrow, heroSubtitle, heroTitle, tagline } from "@/lib/landing/content";

export default function HomePage() {
  return (
    <div
      style={{
        maxWidth: "var(--max-width-wide)",
        margin: "0 auto",
        padding: "var(--page-gutter)",
        display: "grid",
        gap: 72,
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          borderBottom: "var(--border-hairline) solid var(--line)",
          paddingBottom: 24,
        }}
      >
        <div style={{ display: "grid", gap: 2 }}>
          <Wordmark />
          <span
            className="mono"
            style={{
              fontSize: 11,
              color: "var(--text-faint)",
              letterSpacing: "0.1em",
              // alinhado ao texto do wordmark (anel 27 + gap 10), não ao símbolo ✦
              marginLeft: 37,
            }}
          >
            {tagline}
          </span>
        </div>
        <a href={entrar.href} className="btn-ghost">
          {entrar.label}
        </a>
      </header>

      <section
        style={{
          maxWidth: "var(--hero-max)",
          display: "grid",
          gap: 20,
        }}
      >
        <p
          className="mono"
          style={{ margin: 0, color: "var(--accent)", fontSize: 12, letterSpacing: "0.16em" }}
        >
          {eyebrow}
        </p>
        <h1 style={{ fontSize: "clamp(40px, 8vw, 74px)", lineHeight: 0.92 }}>
          {heroTitle.lead} <span style={{ color: "var(--accent)" }}>{heroTitle.accent}</span>
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.55, color: "var(--text-muted)", maxWidth: "50ch" }}>
          {heroSubtitle}
        </p>
      </section>

      <section>
        <StepCards />
      </section>

      <section style={{ display: "grid", gap: 20 }}>
        <h2
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--text-faint)",
          }}
        >
          Um exemplo de bordo
        </h2>
        <BoardingPassRibbon />
      </section>

      <footer
        style={{
          borderTop: "var(--border-hairline) solid var(--line)",
          paddingTop: 24,
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Wordmark size={14} />
        <span className="mono" style={{ fontSize: 9, color: "var(--text-faintest)" }}>
          Decidam o translado juntos
        </span>
      </footer>
    </div>
  );
}
