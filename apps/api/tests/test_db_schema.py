"""Testes de bootstrap de schema do banco."""

import pytest
from fastapi import HTTPException
from sqlalchemy import inspect
from sqlmodel import create_engine

from traveltogether.identity.models import User
from traveltogether.platform.db import create_db_schema, get_engine, get_session


def test_create_db_schema_creates_identity_user_table() -> None:
    engine = create_engine("sqlite://")

    create_db_schema(engine)

    assert inspect(engine).has_table(User.__tablename__)


def test_get_session_returns_503_when_database_url_is_missing(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.delenv("DATABASE_URL", raising=False)
    get_engine.cache_clear()

    with pytest.raises(HTTPException) as exc_info:
        next(get_session())

    assert exc_info.value.status_code == 503
    assert exc_info.value.detail == "DATABASE_URL is not configured"


def test_get_session_returns_503_when_database_url_is_invalid(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("DATABASE_URL", "not a sqlalchemy url")
    get_engine.cache_clear()

    with pytest.raises(HTTPException) as exc_info:
        next(get_session())

    assert exc_info.value.status_code == 503
    assert exc_info.value.detail == "DATABASE_URL is not a valid SQLAlchemy URL"
