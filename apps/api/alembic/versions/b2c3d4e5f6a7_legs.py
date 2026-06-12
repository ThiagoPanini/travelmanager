"""legs

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-06-09

"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy import inspect

from alembic import op

revision: str = "b2c3d4e5f6a7"
down_revision: str | None = "a1b2c3d4e5f6"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _table_exists(table_name: str) -> bool:
    return inspect(op.get_bind()).has_table(table_name)


def upgrade() -> None:
    if not _table_exists("legs"):
        op.create_table(
            "legs",
            sa.Column("id", sa.UUID(), nullable=False),
            sa.Column("trip_id", sa.UUID(), nullable=False),
            sa.Column("origin_stop_id", sa.UUID(), nullable=True),
            sa.Column("destination_stop_id", sa.UUID(), nullable=True),
            sa.Column("target_date", sa.DateTime(timezone=True), nullable=True),
            sa.Column("order", sa.Integer(), nullable=False),
            sa.ForeignKeyConstraint(["destination_stop_id"], ["stops.id"]),
            sa.ForeignKeyConstraint(["origin_stop_id"], ["stops.id"]),
            sa.ForeignKeyConstraint(["trip_id"], ["trips.id"]),
            sa.PrimaryKeyConstraint("id"),
        )


def downgrade() -> None:
    op.drop_table("legs")
