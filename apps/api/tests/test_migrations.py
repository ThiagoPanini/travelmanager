"""Migration regressions for legacy database states."""

from pathlib import Path

import pytest
from alembic.config import Config
from sqlalchemy import create_engine, inspect

from alembic import command
from traveltogether.platform.db import create_db_schema


def test_alembic_upgrade_recovers_database_bootstrapped_by_create_all(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    database_path = tmp_path / "legacy.db"
    database_url = f"sqlite:///{database_path}"
    engine = create_engine(database_url)

    create_db_schema(engine)
    monkeypatch.setenv("DATABASE_URL", database_url)

    config = Config("alembic.ini")
    config.set_main_option("sqlalchemy.url", database_url)

    command.upgrade(config, "head")

    inspector = inspect(engine)
    trip_columns = {column["name"] for column in inspector.get_columns("trips")}

    assert inspector.has_table("alembic_version")
    assert "cover_image_key" in trip_columns
    assert "cover_image_url" in trip_columns
