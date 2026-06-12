"""stops

Revision ID: a1b2c3d4e5f6
Revises: 7039512b819d
Create Date: 2026-06-09

"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy import inspect

from alembic import op

revision: str = "a1b2c3d4e5f6"
down_revision: str | None = "7039512b819d"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _table_exists(table_name: str) -> bool:
    return inspect(op.get_bind()).has_table(table_name)


def upgrade() -> None:
    if not _table_exists("stops"):
        op.create_table(
            "stops",
            sa.Column("id", sa.UUID(), nullable=False),
            sa.Column("trip_id", sa.UUID(), nullable=False),
            sa.Column("city", sa.String(), nullable=False),
            sa.Column("arrival_date", sa.DateTime(timezone=True), nullable=True),
            sa.Column("departure_date", sa.DateTime(timezone=True), nullable=True),
            sa.Column("order", sa.Integer(), nullable=False),
            sa.ForeignKeyConstraint(["trip_id"], ["trips.id"]),
            sa.PrimaryKeyConstraint("id"),
        )


def downgrade() -> None:
    op.drop_table("stops")
