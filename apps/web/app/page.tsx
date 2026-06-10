import Link from "next/link";

const planningSteps = [
  {
    ix: "A",
    title: "Cadastre uma viagem",
    text: "Defina origem, paradas e datas. O esqueleto da viagem fica num lugar só, fácil de acompanhar.",
  },
  {
    ix: "B",
    title: "Adicione amigos",
    text: "Convide o grupo por e-mail. Organizadores editam, todo mundo acompanha as decisões.",
  },
  {
    ix: "C",
    title: "Registre passagens e roteiros",
    text: "Cole pesquisas de passagem e dê forma ao roteiro conforme o plano evolui.",
  },
];

const features = [
  {
    category: "organização",
    title: "Viagens em um só lugar",
    text: "Centralize a viagem com origem, paradas e participantes, sem depender de mensagens perdidas no grupo.",
    preview: "a",
  },
  {
    category: "pesquisa",
    title: "Passagens comparáveis",
    text: "Registre pesquisas de passagem com preço, datas, duração, bagagem e link, e deixe o grupo sinalizar preferências com upvotes.",
    preview: "b",
  },
  {
    category: "roteiro",
    title: "Plano compartilhado",
    text: "Dê forma ao roteiro e aos planos do grupo conforme a viagem deixa de ser ideia e vira decisão.",
    preview: "c",
  },
];

function FeaturePreview({ type }: { type: string }) {
  if (type === "a") {
    return (
      <div className="feature-preview feature-preview-a">
        <div className="preview-bar w1" />
        <div className="preview-bar w2" />
        <div className="preview-bar w3" />
        <div className="preview-bar w2" />
        <div className="preview-route">
          <span className="preview-node" style={{ top: "8%" }} />
          <span className="preview-node" style={{ top: "40%" }} />
          <span className="preview-node" style={{ top: "72%" }} />
        </div>
      </div>
    );
  }

  if (type === "b") {
    return (
      <div className="feature-preview feature-preview-b">
        <div className="preview-ticket">
          <div className="preview-stub">
            <span className="preview-code">GRU</span>
          </div>
          <span className="preview-code preview-code-r">LIS</span>
        </div>
      </div>
    );
  }

  return (
    <div className="feature-preview feature-preview-c">
      <svg viewBox="0 0 320 148" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M30 110 Q110 20 180 70 T300 40"
          fill="none"
          stroke="#e0556b"
          strokeDasharray="4 4"
          strokeWidth="1.5"
        />
        <circle cx="30" cy="110" fill="#e0556b" r="4" />
        <circle cx="180" cy="70" fill="#f2879a" r="4" />
        <circle cx="300" cy="40" fill="#e0556b" r="4" />
      </svg>
      <span className="preview-coord">38.7°N 9.1°W · Lisboa</span>
    </div>
  );
}

export default function Home() {
  return (
    <div className="public-home">
      <header className="public-nav">
        <Link className="wordmark" href="/">
          <span className="wordmark-ticket">TT</span>
          <span>traveltogether</span>
        </Link>
        <Link className="primary-button btn-sm" href="/login">
          Entrar
        </Link>
      </header>

      <main className="public-wrap">
        <section className="public-hero">
          <p className="public-eyebrow">traveltogether</p>
          <h1>
            Organizar viagens em grupo de maneira <span>fácil</span> e <span>rápida</span>
          </h1>
          <p className="public-lede">
            Um hub centralizado para consolidar tudo da sua viagem com amigos: compartilhe preços de
            passagens, paradas, roteiro e planos do grupo para tornar a organização mais fácil.
          </p>
          <div
            className="public-route-strip"
            aria-label="Rota exemplo: GRU, LIS, BCN, FCO, ATH, GRU"
            role="img"
          >
            <b>GRU</b>
            <span className="route-dash" />
            <b>LIS</b>
            <span className="route-dash" />
            <b>BCN</b>
            <span className="route-dash" />
            <b>FCO</b>
            <span className="route-dash" />
            <b>ATH</b>
            <span className="route-dash" />
            <b>GRU</b>
          </div>
        </section>

        <section className="public-section" aria-labelledby="planning-title">
          <div className="public-sec-head">
            <span className="public-sec-num">01</span>
            <h2 id="planning-title">Controle e planejamento da viagem</h2>
            <span className="public-sec-line" />
          </div>
          <div className="planning-grid">
            {planningSteps.map((step) => (
              <article className="planning-cell" key={step.ix}>
                <h3>
                  <span>{step.ix}</span>
                  {step.title}
                </h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="public-section" aria-labelledby="why-title">
          <div className="public-sec-head">
            <span className="public-sec-num">02</span>
            <h2 id="why-title">Por que traveltogether?</h2>
            <span className="public-sec-line" />
          </div>
          <div className="feature-cards">
            {features.map((feature) => (
              <article className="feature-card" key={feature.title}>
                <div className="feature-visual">
                  <FeaturePreview type={feature.preview} />
                </div>
                <div className="feature-body">
                  <div className="feature-tag">{feature.category}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="public-footer">
        <div>
          <span className="wordmark">
            <span className="wordmark-ticket">TT</span>
            <span>traveltogether</span>
          </span>
          <p>
            Feito para grupos que querem decidir a viagem juntos, antes que o planejamento vire
            ruído.
          </p>
        </div>
        <nav aria-label="Links da home">
          <Link href="/login">Entrar</Link>
          <Link href="/trips">Viagens</Link>
        </nav>
      </footer>
    </div>
  );
}
