"""Testes de integração do construtor de Rotas e Trechos (#144)."""

import uuid
from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

from traveltogether.identity.auth import generate_token
from traveltogether.identity.models import User
from traveltogether.main import app
from traveltogether.platform.db import get_session
from traveltogether.trips.models import Membership, MembershipRole

TEST_SECRET = "public-test-auth-secret-not-for-production"
ALICE_EMAIL = "alice@example.com"
BOB_EMAIL = "bob@example.com"


@pytest.fixture(name="session")
def session_fixture() -> Iterator[Session]:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    SQLModel.metadata.drop_all(engine)


@pytest.fixture(name="client")
def client_fixture(session: Session) -> Iterator[TestClient]:
    app.dependency_overrides[get_session] = lambda: session
    client = TestClient(app, raise_server_exceptions=True)
    yield client  # type: ignore[misc]
    app.dependency_overrides.clear()


def _auth_headers(email: str, monkeypatch: pytest.MonkeyPatch) -> dict[str, str]:
    monkeypatch.setenv("AUTH_SECRET", TEST_SECRET)
    token = generate_token(email, secret=TEST_SECRET)
    return {"Authorization": f"Bearer {token}"}


def _create_trip_with_leg(client: TestClient, headers: dict[str, str]) -> tuple[str, str]:
    trip = client.post(
        "/trips",
        json={"name": "EUA Trip", "description": "", "origin": "São Paulo"},
        headers=headers,
    ).json()["trip"]
    leg = client.post(
        f"/trips/{trip['id']}/legs",
        json={"origin_stop_id": None, "destination_stop_id": None},
        headers=headers,
    ).json()
    return str(trip["id"]), str(leg["id"])


def _add_member(session: Session, trip_id: str, email: str) -> None:
    # cria o usuário direto (JIT só acontece no login) e a Membership.
    member = User(id=uuid.uuid4(), email=email)
    session.add(member)
    session.commit()
    session.add(
        Membership(trip_id=uuid.UUID(trip_id), user_id=member.id, role=MembershipRole.member)
    )
    session.commit()


def test_get_routes_lists_default_route_with_segment(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    headers = _auth_headers(ALICE_EMAIL, monkeypatch)
    trip_id, leg_id = _create_trip_with_leg(client, headers)

    res = client.get(f"/trips/{trip_id}/legs/{leg_id}/routes", headers=headers)
    assert res.status_code == 200
    routes = res.json()
    assert [r["label"] for r in routes] == ["Direto"]
    assert len(routes[0]["segments"]) == 1


def test_build_route_via_miami(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    headers = _auth_headers(ALICE_EMAIL, monkeypatch)
    trip_id, leg_id = _create_trip_with_leg(client, headers)

    route = client.post(
        f"/trips/{trip_id}/legs/{leg_id}/routes",
        json={"label": "via Miami"},
        headers=headers,
    ).json()
    for origin, dest in (("GRU", "MIA"), ("MIA", "NYC")):
        client.post(
            f"/trips/{trip_id}/legs/{leg_id}/routes/{route['id']}/segments",
            json={"origin_airport": origin, "destination_airport": dest},
            headers=headers,
        )

    routes = client.get(f"/trips/{trip_id}/legs/{leg_id}/routes", headers=headers).json()
    via = next(r for r in routes if r["label"] == "via Miami")
    pairs = [(s["origin_airport"], s["destination_airport"]) for s in via["segments"]]
    assert pairs == [("GRU", "MIA"), ("MIA", "NYC")]


def test_member_can_author_route(
    client: TestClient, session: Session, monkeypatch: pytest.MonkeyPatch
) -> None:
    alice = _auth_headers(ALICE_EMAIL, monkeypatch)
    trip_id, leg_id = _create_trip_with_leg(client, alice)
    _add_member(session, trip_id, BOB_EMAIL)
    bob = _auth_headers(BOB_EMAIL, monkeypatch)

    res = client.post(
        f"/trips/{trip_id}/legs/{leg_id}/routes",
        json={"label": "via Panamá"},
        headers=bob,
    )
    assert res.status_code == 201


def test_non_member_gets_403(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    alice = _auth_headers(ALICE_EMAIL, monkeypatch)
    trip_id, leg_id = _create_trip_with_leg(client, alice)
    bob = _auth_headers(BOB_EMAIL, monkeypatch)

    res = client.post(
        f"/trips/{trip_id}/legs/{leg_id}/routes",
        json={"label": "intrusa"},
        headers=bob,
    )
    assert res.status_code == 403


def test_reorder_segments_endpoint(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    headers = _auth_headers(ALICE_EMAIL, monkeypatch)
    trip_id, leg_id = _create_trip_with_leg(client, headers)
    route = client.post(
        f"/trips/{trip_id}/legs/{leg_id}/routes",
        json={"label": "via Miami"},
        headers=headers,
    ).json()
    ids = []
    for origin, dest in (("GRU", "MIA"), ("MIA", "NYC")):
        seg = client.post(
            f"/trips/{trip_id}/legs/{leg_id}/routes/{route['id']}/segments",
            json={"origin_airport": origin, "destination_airport": dest},
            headers=headers,
        ).json()
        ids.append(seg["id"])

    res = client.post(
        f"/trips/{trip_id}/legs/{leg_id}/routes/{route['id']}/segments/reorder",
        json={"segment_ids": list(reversed(ids))},
        headers=headers,
    )
    assert res.status_code == 200
    assert [s["id"] for s in res.json()] == list(reversed(ids))


def test_author_deletes_own_route(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    headers = _auth_headers(ALICE_EMAIL, monkeypatch)
    trip_id, leg_id = _create_trip_with_leg(client, headers)
    route = client.post(
        f"/trips/{trip_id}/legs/{leg_id}/routes",
        json={"label": "via Miami"},
        headers=headers,
    ).json()

    res = client.delete(f"/trips/{trip_id}/legs/{leg_id}/routes/{route['id']}", headers=headers)
    assert res.status_code == 204
    labels = [
        r["label"]
        for r in client.get(f"/trips/{trip_id}/legs/{leg_id}/routes", headers=headers).json()
    ]
    assert labels == ["Direto"]
