"""trip: periodo e aeroporto de referencia

Revision ID: f6a7b8c9d0e1
Revises: e5f6a7b8c9d0
Create Date: 2026-06-10

"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy import inspect

from alembic import op

revision: str = "f6a7b8c9d0e1"
down_revision: str | None = "e5f6a7b8c9d0"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _column_exists(table_name: str, column_name: str) -> bool:
    columns = inspect(op.get_bind()).get_columns(table_name)
    return any(column["name"] == column_name for column in columns)


def upgrade() -> None:
    if not _column_exists("trips", "airport_code"):
        op.add_column("trips", sa.Column("airport_code", sa.String(), nullable=True))
    if not _column_exists("trips", "start_date"):
        op.add_column("trips", sa.Column("start_date", sa.Date(), nullable=True))
    if not _column_exists("trips", "end_date"):
        op.add_column("trips", sa.Column("end_date", sa.Date(), nullable=True))


def downgrade() -> None:
    op.drop_column("trips", "end_date")
    op.drop_column("trips", "start_date")
    op.drop_column("trips", "airport_code")
