"""Serviço de `Rota`s (routes) e `Trecho`s (segments) de um `Trajeto` (ADR-0018/0019).

Modelo de 4 níveis: `Trajeto` (Leg) → `Rota` (Route, autorada) → `Trecho`
(Segment, unidade de comparação) → `Pesquisa de Passagem` (ancora no Trecho).

Todo `Trajeto` nasce com uma `Rota` "direta" de um único `Trecho` aéreo
(esqueleto do #143); o construtor multi-Rota é o #144. Resolução para cima
(`Trecho` → `Rota` → `Trajeto` → `Viagem`) é interface explícita para outros
boundaries (fares/budget) sem importar modelos cross-boundary além do necessário.
"""

import uuid

from sqlmodel import Session, col, func, select

from traveltogether.trips.models import (
    Leg,
    MembershipRole,
    Route,
    Segment,
    SegmentMode,
    Stop,
    Trip,
)

DEFAULT_ROUTE_LABEL = "Direto"


class RouteWriteError(Exception):
    """Remoção barrada pelo gate de moderação (invariante 25)."""


def _leg_airports(session: Session, leg: Leg) -> tuple[str | None, str | None]:
    """Aeroportos de origem/destino derivados das `Parada`s do `Trajeto`.

    Origem cai para o aeroporto da `Viagem` quando o `Trajeto` começa na Origem
    (sem `Parada` de origem). Qualquer um pode ser `None` no esqueleto.
    """
    origin_airport: str | None = None
    destination_airport: str | None = None
    if leg.origin_stop_id is not None:
        origin_stop = session.get(Stop, leg.origin_stop_id)
        origin_airport = origin_stop.airport_code if origin_stop else None
    else:
        trip = session.get(Trip, leg.trip_id)
        origin_airport = trip.airport_code if trip else None
    if leg.destination_stop_id is not None:
        dest_stop = session.get(Stop, leg.destination_stop_id)
        destination_airport = dest_stop.airport_code if dest_stop else None
    return origin_airport, destination_airport


def list_routes(session: Session, leg_id: uuid.UUID) -> list[Route]:
    return list(
        session.exec(select(Route).where(col(Route.leg_id) == leg_id).order_by(col(Route.order)))
    )


def list_segments(session: Session, route_id: uuid.UUID) -> list[Segment]:
    return list(
        session.exec(
            select(Segment).where(col(Segment.route_id) == route_id).order_by(col(Segment.order))
        )
    )


def ensure_default_route_and_segment(
    session: Session, leg: Leg, *, created_by: uuid.UUID, commit: bool = True
) -> Segment:
    """Garante a `Rota` "direta" do `Trajeto` com seu `Trecho` aéreo único.

    Idempotente: se o `Trajeto` já tem qualquer `Rota`, devolve o `Trecho` da
    primeira. Senão cria Rota+Trecho (aeroportos derivados das `Parada`s).
    """
    existing = list_routes(session, leg.id)
    if existing:
        segments = list_segments(session, existing[0].id)
        if segments:
            return segments[0]
        origin_airport, destination_airport = _leg_airports(session, leg)
        segment = Segment(
            route_id=existing[0].id,
            mode=SegmentMode.air,
            origin_airport=origin_airport,
            destination_airport=destination_airport,
            order=1,
        )
        session.add(segment)
    else:
        route = Route(leg_id=leg.id, label=DEFAULT_ROUTE_LABEL, order=1, created_by=created_by)
        session.add(route)
        session.flush()
        origin_airport, destination_airport = _leg_airports(session, leg)
        segment = Segment(
            route_id=route.id,
            mode=SegmentMode.air,
            origin_airport=origin_airport,
            destination_airport=destination_airport,
            order=1,
        )
        session.add(segment)
    if commit:
        session.commit()
        session.refresh(segment)
    else:
        session.flush()
    return segment


def default_segment_for_leg(session: Session, leg_id: uuid.UUID) -> Segment | None:
    """`Trecho` default do `Trajeto`: primeiro `Trecho` da primeira `Rota`."""
    routes = list_routes(session, leg_id)
    if not routes:
        return None
    segments = list_segments(session, routes[0].id)
    return segments[0] if segments else None


def leg_segment_ids(session: Session, leg_id: uuid.UUID) -> list[uuid.UUID]:
    """IDs de todos os `Trecho`s sob qualquer `Rota` do `Trajeto`."""
    return list(
        session.exec(
            select(Segment.id)
            .join(Route, col(Route.id) == col(Segment.route_id))
            .where(col(Route.leg_id) == leg_id)
        )
    )


def segment_leg_id(session: Session, segment_id: uuid.UUID) -> uuid.UUID | None:
    """`Trajeto` dono do `Trecho` (via `Rota`), ou None."""
    segment = session.get(Segment, segment_id)
    if segment is None:
        return None
    route = session.get(Route, segment.route_id)
    return route.leg_id if route is not None else None


def segment_trip_id(session: Session, segment_id: uuid.UUID) -> uuid.UUID | None:
    """`Viagem` dona do `Trecho` (via `Rota`→`Trajeto`), ou None."""
    leg_id = segment_leg_id(session, segment_id)
    if leg_id is None:
        return None
    leg = session.get(Leg, leg_id)
    return leg.trip_id if leg is not None else None


def delete_routes_for_leg(session: Session, leg_id: uuid.UUID, *, commit: bool = True) -> None:
    """Apaga `Rota`s e `Trecho`s de um `Trajeto` (cascata antes de remover o Leg).

    Pressupõe que não há `Pesquisa` ancorada (o chamador já validou via
    `leg_has_fare_quotes`).
    """
    routes = list_routes(session, leg_id)
    for route in routes:
        for segment in list_segments(session, route.id):
            session.delete(segment)
        session.delete(route)
    if commit:
        session.commit()
    else:
        session.flush()


# --- construtor multi-Rota (#144) ------------------------------------------


def _next_order(values: list[int]) -> int:
    return (max(values) + 1) if values else 1


def create_route(
    session: Session, leg_id: uuid.UUID, *, created_by: uuid.UUID, label: str = ""
) -> Route:
    """Cria uma `Rota` vazia no `Trajeto`, no fim da ordem (camada de exploração)."""
    order = _next_order([r.order for r in list_routes(session, leg_id)])
    route = Route(leg_id=leg_id, label=label, order=order, created_by=created_by)
    session.add(route)
    session.commit()
    session.refresh(route)
    return route


def add_segment(
    session: Session,
    route_id: uuid.UUID,
    *,
    origin_airport: str | None = None,
    destination_airport: str | None = None,
    mode: SegmentMode = SegmentMode.air,
) -> Segment:
    """Acrescenta um `Trecho` ao fim da `Rota` (sequência ordenada, invariante 22)."""
    order = _next_order([s.order for s in list_segments(session, route_id)])
    segment = Segment(
        route_id=route_id,
        mode=mode,
        origin_airport=origin_airport,
        destination_airport=destination_airport,
        order=order,
    )
    session.add(segment)
    session.commit()
    session.refresh(segment)
    return segment


def update_route(session: Session, route: Route, *, label: str | None = None) -> Route:
    if label is not None:
        route.label = label
    session.add(route)
    session.commit()
    session.refresh(route)
    return route


def update_segment(
    session: Session,
    segment: Segment,
    *,
    origin_airport: str | None = None,
    destination_airport: str | None = None,
    mode: SegmentMode | None = None,
) -> Segment:
    if origin_airport is not None:
        segment.origin_airport = origin_airport
    if destination_airport is not None:
        segment.destination_airport = destination_airport
    if mode is not None:
        segment.mode = mode
    session.add(segment)
    session.commit()
    session.refresh(segment)
    return segment


def reorder_segments(
    session: Session, route_id: uuid.UUID, ordered_ids: list[uuid.UUID]
) -> list[Segment]:
    """Reordena os `Trecho`s da `Rota` conforme `ordered_ids` (1-based, contíguo)."""
    by_id = {s.id: s for s in list_segments(session, route_id)}
    if set(ordered_ids) != set(by_id):
        raise RouteWriteError("ordered_ids must match the route's segments exactly")
    for index, segment_id in enumerate(ordered_ids, start=1):
        segment = by_id[segment_id]
        segment.order = index
        session.add(segment)
    session.commit()
    return list_segments(session, route_id)


def _segments_have_foreign_content(
    session: Session, segment_ids: list[uuid.UUID], owner_id: uuid.UUID
) -> bool:
    """Há `Pesquisa`/`Preferida` de **outra** pessoa nos `Trecho`s? (invariante 25).

    Interface explícita do boundary fares — import tardio para não acoplar os
    modelos cross-boundary nem criar ciclo de import.
    """
    if not segment_ids:
        return False
    from traveltogether.fares.service import segments_have_foreign_content

    return segments_have_foreign_content(session, segment_ids, owner_id)


def _delete_segment_row(session: Session, segment: Segment) -> None:
    from traveltogether.fares.service import detach_segment

    detach_segment(session, segment.id)
    session.delete(segment)


def remove_route(
    session: Session, route: Route, *, user_id: uuid.UUID, role: MembershipRole
) -> None:
    """Remove uma `Rota` e seus `Trecho`s sob o gate da invariante 25.

    `Organizador` remove qualquer uma (moderação/prune). Senão só o autor, e só
    enquanto a `Rota` não carrega `Pesquisa`/`Preferida` de terceiros.
    """
    segment_ids = [s.id for s in list_segments(session, route.id)]
    if role != MembershipRole.organizer:
        if route.created_by != user_id:
            raise RouteWriteError("only the author or an organizer can remove this route")
        if _segments_have_foreign_content(session, segment_ids, user_id):
            raise RouteWriteError("route carries third-party content; pruning is organizer-only")
    for segment in list_segments(session, route.id):
        _delete_segment_row(session, segment)
    session.delete(route)
    session.commit()


def remove_segment(
    session: Session, segment: Segment, *, user_id: uuid.UUID, role: MembershipRole
) -> None:
    """Remove um `Trecho` sob o gate da invariante 25 (autoria herdada da `Rota`)."""
    route = session.get(Route, segment.route_id)
    if route is None:
        raise RouteWriteError("segment has no route")
    if role != MembershipRole.organizer:
        if route.created_by != user_id:
            raise RouteWriteError("only the author or an organizer can remove this segment")
        if _segments_have_foreign_content(session, [segment.id], user_id):
            raise RouteWriteError("segment carries third-party content; pruning is organizer-only")
    _delete_segment_row(session, segment)
    session.commit()


def trip_has_segments(session: Session, trip_id: uuid.UUID) -> bool:
    count = session.exec(
        select(func.count())
        .select_from(Segment)
        .join(Route, col(Route.id) == col(Segment.route_id))
        .join(Leg, col(Leg.id) == col(Route.leg_id))
        .where(col(Leg.trip_id) == trip_id)
    ).one()
    return count > 0
