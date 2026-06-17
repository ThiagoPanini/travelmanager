"""Testes do esqueleto Rota/Trecho (ADR-0018/0019, #143)."""

import uuid
from collections.abc import Iterator

import pytest
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

import traveltogether.fares.models  # noqa: F401  # pyright: ignore[reportUnusedImport]  (registra tabelas de fares)
from traveltogether.identity.models import User
from traveltogether.trips.legs_service import create_leg, delete_leg
from traveltogether.trips.models import MembershipRole, SegmentMode
from traveltogether.trips.routes_service import (
    RouteWriteError,
    add_segment,
    create_route,
    default_segment_for_leg,
    list_routes,
    list_segments,
    remove_route,
    remove_segment,
    reorder_segments,
    segment_leg_id,
    segment_trip_id,
    update_route,
    update_segment,
)
from traveltogether.trips.service import create_trip


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


@pytest.fixture(name="user")
def user_fixture(session: Session) -> User:
    user = User(id=uuid.uuid4(), email="alice@example.com")
    session.add(user)
    session.commit()
    return user


def test_new_leg_has_default_route_and_air_segment(session: Session, user: User) -> None:
    trip, _ = create_trip(session, user.id, "EUA Trip", "", "São Paulo")
    leg = create_leg(session, trip.id)

    routes = list_routes(session, leg.id)
    assert len(routes) == 1
    assert routes[0].leg_id == leg.id

    segments = list_segments(session, routes[0].id)
    assert len(segments) == 1
    assert segments[0].mode == SegmentMode.air


def test_default_segment_resolves_for_leg(session: Session, user: User) -> None:
    trip, _ = create_trip(session, user.id, "EUA Trip", "", "São Paulo")
    leg = create_leg(session, trip.id)
    segment = default_segment_for_leg(session, leg.id)
    assert segment is not None
    assert segment_leg_id(session, segment.id) == leg.id
    assert segment_trip_id(session, segment.id) == trip.id


def test_delete_leg_cascades_routes_and_segments(session: Session, user: User) -> None:
    trip, _ = create_trip(session, user.id, "EUA Trip", "", "São Paulo")
    leg = create_leg(session, trip.id)
    route_id = list_routes(session, leg.id)[0].id
    delete_leg(session, leg)
    assert list_routes(session, leg.id) == []
    assert list_segments(session, route_id) == []


# --- construtor multi-Rota (#144) ------------------------------------------


def _other_user(session: Session) -> User:
    other = User(id=uuid.uuid4(), email=f"{uuid.uuid4().hex}@example.com")
    session.add(other)
    session.commit()
    return other


def test_create_route_via_miami_alongside_direct(session: Session, user: User) -> None:
    trip, _ = create_trip(session, user.id, "EUA Trip", "", "São Paulo")
    leg = create_leg(session, trip.id)  # nasce com a Rota "Direto"

    route = create_route(session, leg.id, created_by=user.id, label="via Miami")
    add_segment(session, route.id, origin_airport="GRU", destination_airport="MIA")
    add_segment(session, route.id, origin_airport="MIA", destination_airport="NYC")

    routes = list_routes(session, leg.id)
    assert [r.label for r in routes] == ["Direto", "via Miami"]
    assert routes[1].created_by == user.id

    segments = list_segments(session, route.id)
    assert [(s.origin_airport, s.destination_airport) for s in segments] == [
        ("GRU", "MIA"),
        ("MIA", "NYC"),
    ]
    assert [s.order for s in segments] == [1, 2]
    assert all(s.mode == SegmentMode.air for s in segments)


def test_update_route_label_and_segment_airports(session: Session, user: User) -> None:
    trip, _ = create_trip(session, user.id, "EUA Trip", "", "São Paulo")
    leg = create_leg(session, trip.id)
    route = create_route(session, leg.id, created_by=user.id, label="rascunho")
    seg = add_segment(session, route.id, origin_airport="GRU", destination_airport="MIA")

    assert update_route(session, route, label="via Miami").label == "via Miami"
    updated = update_segment(session, seg, origin_airport="GRU", destination_airport="MCO")
    assert (updated.origin_airport, updated.destination_airport) == ("GRU", "MCO")


def test_reorder_segments_changes_order(session: Session, user: User) -> None:
    trip, _ = create_trip(session, user.id, "EUA Trip", "", "São Paulo")
    leg = create_leg(session, trip.id)
    route = create_route(session, leg.id, created_by=user.id, label="via Miami")
    a = add_segment(session, route.id, origin_airport="GRU", destination_airport="MIA")
    b = add_segment(session, route.id, origin_airport="MIA", destination_airport="NYC")

    reordered = reorder_segments(session, route.id, [b.id, a.id])
    assert [s.id for s in reordered] == [b.id, a.id]
    assert [s.order for s in list_segments(session, route.id)] == [1, 2]
    assert [s.id for s in list_segments(session, route.id)] == [b.id, a.id]


def test_author_removes_own_empty_route(session: Session, user: User) -> None:
    trip, _ = create_trip(session, user.id, "EUA Trip", "", "São Paulo")
    leg = create_leg(session, trip.id)
    route = create_route(session, leg.id, created_by=user.id, label="via Miami")
    add_segment(session, route.id, origin_airport="GRU", destination_airport="MIA")

    remove_route(session, route, user_id=user.id, role=MembershipRole.member)
    assert [r.label for r in list_routes(session, leg.id)] == ["Direto"]


def test_non_author_member_cannot_remove_route_with_foreign_content(
    session: Session, user: User
) -> None:
    trip, _ = create_trip(session, user.id, "EUA Trip", "", "São Paulo")
    leg = create_leg(session, trip.id)
    route = create_route(session, leg.id, created_by=user.id, label="via Miami")
    seg = add_segment(session, route.id, origin_airport="GRU", destination_airport="MIA")

    # outra pessoa registra uma Pesquisa no Trecho → conteúdo de terceiros.
    other = _other_user(session)
    _register_fare(session, leg.id, seg.id, other.id)

    with pytest.raises(RouteWriteError):
        remove_route(session, route, user_id=user.id, role=MembershipRole.member)


def test_organizer_prunes_route_with_foreign_content(session: Session, user: User) -> None:
    trip, _ = create_trip(session, user.id, "EUA Trip", "", "São Paulo")
    leg = create_leg(session, trip.id)
    route = create_route(session, leg.id, created_by=user.id, label="via Miami")
    seg = add_segment(session, route.id, origin_airport="GRU", destination_airport="MIA")
    other = _other_user(session)
    _register_fare(session, leg.id, seg.id, other.id)

    remove_route(session, route, user_id=user.id, role=MembershipRole.organizer)
    assert [r.label for r in list_routes(session, leg.id)] == ["Direto"]


def test_remove_segment_gate_blocks_foreign_content(session: Session, user: User) -> None:
    trip, _ = create_trip(session, user.id, "EUA Trip", "", "São Paulo")
    leg = create_leg(session, trip.id)
    route = create_route(session, leg.id, created_by=user.id, label="via Miami")
    seg = add_segment(session, route.id, origin_airport="GRU", destination_airport="MIA")
    other = _other_user(session)
    _register_fare(session, leg.id, seg.id, other.id)

    with pytest.raises(RouteWriteError):
        remove_segment(session, seg, user_id=user.id, role=MembershipRole.member)
    # organizador faz o prune.
    remove_segment(session, seg, user_id=user.id, role=MembershipRole.organizer)
    assert list_segments(session, route.id) == []


def _register_fare(
    session: Session, leg_id: uuid.UUID, segment_id: uuid.UUID, registered_by: uuid.UUID
) -> None:
    from datetime import UTC, datetime
    from decimal import Decimal

    from traveltogether.fares.service import create_fare_quote

    create_fare_quote(
        session=session,
        leg_id=leg_id,
        registered_by=registered_by,
        value=Decimal("1000"),
        currency="BRL",
        flight_date=datetime(2025, 9, 1, tzinfo=UTC),
        duration_minutes=180,
        origin_airport="GRU",
        destination_airport="MIA",
        airline="LATAM",
        segment_id=segment_id,
    )
