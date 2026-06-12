"""stop cover image

Revision ID: i9j0k1l2m3n4
Revises: h8i9j0k1l2m3
Create Date: 2026-06-10

"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy import inspect

from alembic import op

revision: str = "i9j0k1l2m3n4"
down_revision: str | None = "h8i9j0k1l2m3"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _column_exists(table_name: str, column_name: str) -> bool:
    columns = inspect(op.get_bind()).get_columns(table_name)
    return any(column["name"] == column_name for column in columns)


def upgrade() -> None:
    if not _column_exists("stops", "cover_image_key"):
        op.add_column("stops", sa.Column("cover_image_key", sa.String(), nullable=True))
    if not _column_exists("stops", "cover_image_url"):
        op.add_column("stops", sa.Column("cover_image_url", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("stops", "cover_image_url")
    op.drop_column("stops", "cover_image_key")
