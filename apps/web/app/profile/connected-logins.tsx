import { connectedLogins } from "@/lib/identity/connected-logins";

export function ConnectedLogins({ provider }: { provider: string | undefined }) {
  const logins = connectedLogins(provider);

  return (
    <section className="card" style={{ padding: "26px 28px" }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Logins conectados</h2>
      <p className="soft" style={{ fontSize: 14, marginBottom: 22 }}>
        Por onde você entra na conta.
      </p>

      <div style={{ display: "grid", gap: 4 }}>
        {logins.map((login) => (
          <div
            key={login.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "14px 0",
              borderBottom: "1px solid var(--line-soft)",
            }}
          >
            <span style={{ flex: 1, fontWeight: 600, fontSize: 15 }}>{login.label}</span>
            <span className={`chip ${login.connected ? "" : "outline"}`}>
              {login.connected ? "conectado" : "não conectado"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
