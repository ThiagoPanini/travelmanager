import Link from "next/link";

import { Code, Icon } from "@/components/atlas";

const demoCities = [
  { code: "GRU", city: "São Paulo", sub: "origem" },
  { code: "LIS", city: "Lisboa", sub: "5 noites" },
  { code: "CDG", city: "Paris", sub: "5 noites" },
  { code: "FCO", city: "Roma", sub: "4 noites" },
  { code: "GRU", city: "São Paulo", sub: "volta" },
];
const demoEdges = ["✓ escolhida", "2 pesquisas", "1 pesquisa", "sem pesquisas"];

const pillars = [
  {
    n: "01",
    icon: "pin" as const,
    title: "Itinerário com Paradas",
    body: "Origem, cidades e datas formam a espinha da viagem. Os trajetos entre elas aparecem sozinhos.",
  },
  {
    n: "02",
    icon: "plane" as const,
    title: "Pesquisas de Passagem",
    body: "Achou um voo bom? Registra no trajeto: preço, duração, escalas, bagagem. Tudo comparável lado a lado.",
  },
  {
    n: "03",
    icon: "compass" as const,
    title: "Decisão em grupo",
    body: "Cada pessoa dá upvote no que prefere. O organizador bate o martelo marcando a Escolhida.",
  },
];

export default function Home() {
  return (
    <div className="public-home">
      <header className="topbar">
        <div className="shell topbar-in">
          <Link className="brand" href="/">
            <span className="brand-mark">
              <Icon name="plane" size={14} />
            </span>
            travel<em>together</em>
          </Link>
          <div className="topbar-right">
            <Link className="btn small accent" href="/login">
              Entrar
            </Link>
          </div>
        </div>
      </header>

      <div className="page fadeup">
        <div className="shell">
          {/* hero */}
          <div style={{ padding: "56px 0 40px", maxWidth: 820 }}>
            <div className="kicker" style={{ marginBottom: 18 }}>
              planejamento coletivo de viagens
            </div>
            <h1 className="display" style={{ fontSize: "clamp(44px, 7vw, 84px)" }}>
              A viagem do grupo, finalmente fora do grupo do zap.
            </h1>
            <p
              className="soft"
              style={{ fontSize: 19, maxWidth: 560, marginTop: 22, textWrap: "pretty" }}
            >
              Montem o itinerário cidade a cidade, registrem as passagens que cada um encontrou e
              decidam juntos — com votos, não com 200 mensagens.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
              <Link className="btn accent" href="/login">
                Entrar <Icon name="arrowRight" size={15} />
              </Link>
              <a className="btn ghost" href="#demo-route">
                Como funciona
              </a>
            </div>
          </div>

          {/* demo route board */}
          <div className="card" id="demo-route" style={{ padding: "26px 28px", marginTop: 24 }}>
            <div className="section-head" style={{ marginBottom: 6 }}>
              <span className="kicker">exemplo</span>
              <h2 style={{ fontSize: 16 }}>Eurotrip · 10–24 set 2026</h2>
              <span className="spacer" />
              <span className="chip outline">4 viajantes</span>
            </div>
            <div className="routeline">
              {demoCities.map((c, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static demo route
                <span key={i} style={{ display: "contents" }}>
                  {i > 0 && (
                    <span className="route-edge" style={{ cursor: "default" }}>
                      <span
                        className="line"
                        style={{ animation: "dashmove 1.6s linear infinite" }}
                      />
                      <span className="edge-meta">{demoEdges[i - 1]}</span>
                    </span>
                  )}
                  <div className="route-node">
                    <Code code={c.code} size="md" />
                    <span className="city">{c.city}</span>
                    <span className="dates">{c.sub}</span>
                  </div>
                </span>
              ))}
            </div>
          </div>

          {/* three pillars */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 18,
              marginTop: 56,
            }}
          >
            {pillars.map((f) => (
              <div key={f.n} className="card flat" style={{ padding: "24px 22px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <span style={{ color: "var(--accent)" }}>
                    <Icon name={f.icon} size={20} />
                  </span>
                  <span className="mono-num" style={{ fontSize: 12, color: "var(--muted)" }}>
                    {f.n}
                  </span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                <p className="soft" style={{ fontSize: 14.5, textWrap: "pretty" }}>
                  {f.body}
                </p>
              </div>
            ))}
          </div>

          {/* footer note */}
          <div
            style={{
              marginTop: 64,
              display: "flex",
              alignItems: "center",
              gap: 14,
              color: "var(--muted)",
            }}
          >
            <hr className="hairline" style={{ flex: 1 }} />
            <span className="mono" style={{ fontSize: 10 }}>
              beta fechado · acesso por convite
            </span>
            <hr className="hairline" style={{ flex: 1 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
