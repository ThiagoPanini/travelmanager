import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page" style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
      <div style={{ textAlign: "center" }}>
        <div className="kicker" style={{ marginBottom: 12 }}>
          404 · rota desconhecida
        </div>
        <h1 className="display" style={{ fontSize: 34, marginBottom: 18 }}>
          Esse destino não está no itinerário.
        </h1>
        <Link className="btn accent" href="/">
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
