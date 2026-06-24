"""Fixtures e seams do contexto identity.

Concentra os pontos que **seguem o código** durante o refactor hexagonal: o
minting de sessão e o wiring do `TestClient`. Os corpos dos testes de
caracterização afirmam só comportamento observável e **não mudam** — aqui muda
apenas o seam de import quando o código migra para `shared/` + `identity/`.
"""

from collections.abc import Callable, Iterator
from datetime import timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

# --- seams: estes imports seguem o código no refactor ---
from travelmanager.db import get_db
from travelmanager.main import app
from travelmanager.models import User
from travelmanager.sessions import create_session


@pytest.fixture
def client(db_session: Session) -> Iterator[TestClient]:
    """`TestClient` com `get_db` apontado para a sessão SQLite do teste."""
    app.dependency_overrides[get_db] = lambda: db_session
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def mint_session(db_session: Session) -> Callable[..., str]:
    """Cunha uma sessão para o usuário e devolve o token em claro (seam de minting)."""

    def _mint(user: User, *, ttl: timedelta = timedelta(days=30)) -> str:
        _, token = create_session(db_session, user, ttl=ttl)
        return token

    return _mint
