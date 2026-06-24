"""Caracterização HTTP de `POST /auth/profile` (ADR-0004/0005).

Exercita a fatia inteira pela borda (rota → use-case → repos SQLite), com a sessão
real cunhada via `mint_session`. Trava que onboarding grava o Perfil, zera
`needs_onboarding` (refletido em `/auth/me`) e exige autenticação.
"""

from fastapi.testclient import TestClient

from travelmanager.identity.domain.models import User

_PAYLOAD = {"display_name": "Maria", "origin_city": "São Paulo", "country": "BR"}


def _auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


class TestCompleteOnboardingRoute:
    def test_grava_perfil_e_zera_needs_onboarding(
        self, client: TestClient, user: User, mint_session: object
    ) -> None:
        # given: usuário autenticado, ainda sem perfil
        token = mint_session(user)  # type: ignore[operator]
        # when: completa o onboarding
        resp = client.post("/auth/profile", json=_PAYLOAD, headers=_auth(token))
        # then: 200 com perfil gravado e onboarding encerrado
        assert resp.status_code == 200
        body = resp.json()
        assert body["needs_onboarding"] is False
        assert body["profile"]["display_name"] == "Maria"
        assert body["profile"]["origin_city"] == "São Paulo"
        assert body["profile"]["country"] == "BR"
        # e `/auth/me` confirma o estado encerrado
        me = client.get("/auth/me", headers=_auth(token))
        assert me.json()["needs_onboarding"] is False

    def test_sem_sessao_retorna_401(self, client: TestClient) -> None:
        # given/when: sem Bearer
        resp = client.post("/auth/profile", json=_PAYLOAD)
        # then: 401 (a dependency de sessão barra)
        assert resp.status_code == 401

    def test_campo_em_branco_retorna_422(
        self, client: TestClient, user: User, mint_session: object
    ) -> None:
        # given: autenticado, mas nome em branco
        token = mint_session(user)  # type: ignore[operator]
        # when: envia campo obrigatório vazio
        resp = client.post(
            "/auth/profile",
            json={"display_name": "", "origin_city": "São Paulo", "country": "BR"},
            headers=_auth(token),
        )
        # then: 422 com corpo de contrato {code, detail}
        assert resp.status_code == 422
        assert resp.json()["code"] == "domain_error"
