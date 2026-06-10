import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <div>
        <div className="not-found-stamp">GATE CLOSED</div>
        <p className="not-found-route">erro 404 · embarque encerrado pra esta rota</p>
        <Link className="primary-button" href="/">
          Voltar ao portão
        </Link>
      </div>
    </main>
  );
}
