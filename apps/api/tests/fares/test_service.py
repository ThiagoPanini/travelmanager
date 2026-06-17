"""Testes de domínio para fares.service."""

import uuid
from collections.abc import Iterator
from datetime import UTC, datetime
from decimal import Decimal

import pytest
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

from traveltogether.fares.models import FareQuote
from traveltogether.fares.service import (
    create_fare_quote,
    delete_fare_quote,
    fare_leg_id,
    list_fare_quotes,
    update_fare_quote,
)
from traveltogether.identity.models import User
from traveltogether.trips.models import Leg


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


@pytest.fixture(name="leg")
def leg_fixture(session: Session, user: User) -> Leg:
    from traveltogether.trips.legs_service import create_leg
    from traveltogether.trips.service import create_trip

    trip, _ = create_trip(session, user.id, "Road Trip", "", "São Paulo")
    return create_leg(session, trip.id)


def _make_fare(session: Session, user: User, leg: Leg, airline: str = "LATAM") -> FareQuote:
    return create_fare_quote(
        session=session,
        leg_id=leg.id,
        registered_by=user.id,
        value=Decimal("1500.00"),
        currency="BRL",
        flight_date=datetime(2025, 9, 1, tzinfo=UTC),
        duration_minutes=180,
        stops=0,
        checked_baggage=True,
        origin_airport="GRU",
        destination_airport="EZE",
        airline=airline,
    )


def test_create_fare_quote_returns_fare(session: Session, user: User, leg: Leg) -> None:
    fare = _make_fare(session, user, leg)
    assert fare_leg_id(session, fare.id) == leg.id
    assert fare.registered_by == user.id
    assert fare.currency == "BRL"
    assert fare.origin_airport == "GRU"
    assert fare.airline == "LATAM"
    assert fare.stops == 0


def test_list_fare_quotes_returns_fares_for_leg(session: Session, user: User, leg: Leg) -> None:
    _make_fare(session, user, leg, "LATAM")
    _make_fare(session, user, leg, "Gol")
    fares = list_fare_quotes(session, leg.id)
    assert len(fares) == 2
    assert {f.airline for f in fares} == {"LATAM", "Gol"}


def test_update_fare_quote_changes_airline(session: Session, user: User, leg: Leg) -> None:
    fare = _make_fare(session, user, leg)
    updated = update_fare_quote(session, fare, airline="Azul")
    assert updated.airline == "Azul"


def test_delete_fare_quote_removes_it(session: Session, user: User, leg: Leg) -> None:
    fare = _make_fare(session, user, leg)
    delete_fare_quote(session, fare)
    assert list_fare_quotes(session, leg.id) == []


def test_fare_anchors_to_default_segment(session: Session, user: User, leg: Leg) -> None:
    from traveltogether.fares.service import fare_segment_ids, fare_to_public
    from traveltogether.trips.routes_service import default_segment_for_leg

    fare = _make_fare(session, user, leg)
    segment = default_segment_for_leg(session, leg.id)
    assert segment is not None
    assert fare_segment_ids(session, fare.id) == [segment.id]

    public = fare_to_public(session, fare)
    assert public.leg_id == leg.id
    assert public.segment_id == segment.id


def test_ground_segment_rejects_fare(session: Session, user: User, leg: Leg) -> None:
    """`Trecho` terrestre é conector estrutural — não hospeda `Pesquisa` (invariante 26)."""
    from traveltogether.fares.service import GroundSegmentError
    from traveltogether.trips.models import SegmentMode
    from traveltogether.trips.routes_service import add_segment, create_route

    route = create_route(session, leg.id, created_by=user.id, label="via Orlando")
    ground = add_segment(
        session, route.id, origin_airport="ORL", destination_airport="MIA", mode=SegmentMode.ground
    )

    with pytest.raises(GroundSegmentError):
        create_fare_quote(
            session=session,
            leg_id=leg.id,
            registered_by=user.id,
            value=Decimal("100.00"),
            currency="BRL",
            flight_date=datetime(2025, 9, 1, tzinfo=UTC),
            duration_minutes=120,
            origin_airport="ORL",
            destination_airport="MIA",
            airline="",
            segment_id=ground.id,
        )


def test_create_fare_quote_with_points_and_fee(session: Session, user: User, leg: Leg) -> None:
    from traveltogether.fares.service import fare_to_public

    fare = create_fare_quote(
        session=session,
        leg_id=leg.id,
        registered_by=user.id,
        value=Decimal("242.21"),
        currency="BRL",
        flight_date=datetime(2025, 9, 1, tzinfo=UTC),
        duration_minutes=600,
        origin_airport="GRU",
        destination_airport="MIA",
        airline="LATAM",
        points=135_530,
        loyalty_program="milhas LATAM",
    )
    assert fare.points == 135_530
    assert fare.loyalty_program == "milhas LATAM"
    # par de dinheiro (taxa) preservado, sem conversão.
    assert fare.value == Decimal("242.21")

    public = fare_to_public(session, fare)
    assert public.points == 135_530
    assert public.loyalty_program == "milhas LATAM"


def test_create_fare_quote_without_points_defaults_none(
    session: Session, user: User, leg: Leg
) -> None:
    fare = _make_fare(session, user, leg)
    assert fare.points is None
    assert fare.loyalty_program is None


def _round_trip_air_segments(session: Session, user: User, leg: Leg) -> tuple[uuid.UUID, uuid.UUID]:
    """Par invertido GRU→MIA (ida, no `leg`) e MIA→GRU (volta, noutro `Trajeto`)."""
    from traveltogether.trips.legs_service import create_leg
    from traveltogether.trips.models import Leg as LegModel
    from traveltogether.trips.routes_service import add_segment, create_route

    out_route = create_route(session, leg.id, created_by=user.id, label="ida")
    outbound = add_segment(session, out_route.id, origin_airport="GRU", destination_airport="MIA")

    back_leg = create_leg(session, session.get(LegModel, leg.id).trip_id)  # type: ignore[union-attr]
    back_route = create_route(session, back_leg.id, created_by=user.id, label="volta")
    inbound = add_segment(session, back_route.id, origin_airport="MIA", destination_airport="GRU")
    return outbound.id, inbound.id


def test_round_trip_fare_covers_two_segments(session: Session, user: User, leg: Leg) -> None:
    """Uma `Pesquisa` ida-e-volta cobre os dois `Trecho`s aéreos (invariante 11)."""
    from traveltogether.fares.service import (
        fare_segment_ids,
        list_fares_for_segment,
    )

    outbound_id, inbound_id = _round_trip_air_segments(session, user, leg)
    fare = create_fare_quote(
        session=session,
        leg_id=leg.id,
        registered_by=user.id,
        value=Decimal("4200.00"),
        currency="BRL",
        flight_date=datetime(2025, 9, 1, tzinfo=UTC),
        duration_minutes=600,
        origin_airport="GRU",
        destination_airport="MIA",
        airline="LATAM",
        segment_id=outbound_id,
        return_segment_id=inbound_id,
    )
    assert set(fare_segment_ids(session, fare.id)) == {outbound_id, inbound_id}
    assert [f.id for f in list_fares_for_segment(session, outbound_id)] == [fare.id]
    assert [f.id for f in list_fares_for_segment(session, inbound_id)] == [fare.id]


def test_round_trip_fare_to_public_carries_round_trip_seal(
    session: Session, user: User, leg: Leg
) -> None:
    """`FareQuotePublic` expõe `round_trip` + `segment_ids` p/ o selo ida-e-volta."""
    from traveltogether.fares.service import fare_to_public

    outbound_id, inbound_id = _round_trip_air_segments(session, user, leg)
    fare = create_fare_quote(
        session=session,
        leg_id=leg.id,
        registered_by=user.id,
        value=Decimal("4200.00"),
        currency="BRL",
        flight_date=datetime(2025, 9, 1, tzinfo=UTC),
        duration_minutes=600,
        origin_airport="GRU",
        destination_airport="MIA",
        airline="LATAM",
        segment_id=outbound_id,
        return_segment_id=inbound_id,
    )
    public = fare_to_public(session, fare)
    assert public.round_trip is True
    assert set(public.segment_ids) == {outbound_id, inbound_id}

    one_way = _make_fare(session, user, leg)
    assert fare_to_public(session, one_way).round_trip is False


def test_round_trip_preference_resolves_both_and_budget_counts_once(
    session: Session, user: User, leg: Leg
) -> None:
    """`Preferida` na ida-e-volta resolve os dois `Trecho`s; `Orçamento` conta 1×."""
    from traveltogether.fares.preferences_service import (
        preferred_fare_costs_for_trip,
        toggle_preference,
        user_prefers_fare,
    )
    from traveltogether.trips.models import Leg as LegModel

    outbound_id, inbound_id = _round_trip_air_segments(session, user, leg)
    fare = create_fare_quote(
        session=session,
        leg_id=leg.id,
        registered_by=user.id,
        value=Decimal("4200.00"),
        currency="BRL",
        flight_date=datetime(2025, 9, 1, tzinfo=UTC),
        duration_minutes=600,
        origin_airport="GRU",
        destination_airport="MIA",
        airline="LATAM",
        segment_id=outbound_id,
        return_segment_id=inbound_id,
    )
    assert toggle_preference(session, fare.id, user.id) is True
    assert user_prefers_fare(session, fare.id, user.id)

    trip_id = session.get(LegModel, leg.id).trip_id  # type: ignore[union-attr]
    costs = preferred_fare_costs_for_trip(session, trip_id)
    assert costs == [(Decimal("4200.00"), "BRL")]
