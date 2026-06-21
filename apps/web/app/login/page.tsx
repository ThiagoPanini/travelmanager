import { Wordmark } from "@/components/wordmark";

// Stub da Fase 2 (identidade/login ainda não construída): destino real do botão
// "Entrar" da landing, para não publicar link morto. Sem auth — só aviso de "em breve".
export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: "var(--page-gutter)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "var(--login-card)",
          background: "var(--surface)",
          border: "var(--border-hairline) solid var(--line)",
          borderRadius: "var(--radius-lg)",
          padding: 40,
          display: "grid",
          gap: 16,
          justifyItems: "center",
          textAlign: "center",
        }}
      >
        <Wordmark />
        <p
          className="mono"
          style={{ margin: 0, color: "var(--accent)", fontSize: 11, letterSpacing: "0.14em" }}
        >
          controle de embarque
        </p>
        <h1 style={{ fontSize: 34, margin: 0 }}>Login em breve</h1>
        <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)", lineHeight: 1.55 }}>
          Estamos preparando o embarque. Logo você entra com seu código ou com o Google.
        </p>
        <a
          href="/"
          className="mono"
          style={{ fontSize: 11, color: "var(--text-faint)", letterSpacing: "0.1em" }}
        >
          ← Voltar para a landing
        </a>
      </div>
    </main>
  );
}
