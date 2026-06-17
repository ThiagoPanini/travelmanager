"""preferences (decisão por-pessoa) e remoção da Escolhida de grupo (ADR-0018/0019)

Aposenta a `Escolhida` de grupo: cria a tabela `preferences` (`Preferida`/
`Comprada` por `Usuário`×`Trecho`), remove `fare_quotes.is_chosen` e a coluna
`notification_prefs.decision` (tipo de notificação `decision` removido). Aditiva
quanto aos dados: o `is_chosen` de grupo não tem equivalente per-person, então é
descartado (beta, perda aceitável).

Revision ID: t0u1v2w3x4y5
Revises: s9t0u1v2w3x4
Create Date: 2026-06-16

"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy import inspect

from alembic import op

revision: str = "t0u1v2w3x4y5"
down_revision: str | None = "s9t0u1v2w3x4"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _table_exists(table_name: str) -> bool:
    return inspect(op.get_bind()).has_table(table_name)


def _columns(table_name: str) -> list[str]:
    if not _table_exists(table_name):
        return []
    return [c["name"] for c in inspect(op.get_bind()).get_columns(table_name)]


def upgrade() -> None:
    if not _table_exists("preferences"):
        op.create_table(
            "preferences",
            sa.Column("id", sa.Uuid(), nullable=False),
            sa.Column("user_id", sa.Uuid(), nullable=False),
            sa.Column("segment_id", sa.Uuid(), nullable=False),
            sa.Column("fare_quote_id", sa.Uuid(), nullable=False),
            sa.Column("purchased", sa.Boolean(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
            sa.ForeignKeyConstraint(["segment_id"], ["segments.id"]),
            sa.ForeignKeyConstraint(["fare_quote_id"], ["fare_quotes.id"]),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("user_id", "segment_id", name="uq_preference_user_segment"),
        )
        op.create_index("ix_preferences_user_id", "preferences", ["user_id"])
        op.create_index("ix_preferences_segment_id", "preferences", ["segment_id"])
        op.create_index("ix_preferences_fare_quote_id", "preferences", ["fare_quote_id"])

    if "is_chosen" in _columns("fare_quotes"):
        op.drop_column("fare_quotes", "is_chosen")

    if "decision" in _columns("notification_prefs"):
        op.drop_column("notification_prefs", "decision")


def downgrade() -> None:
    if "decision" not in _columns("notification_prefs") and _table_exists("notification_prefs"):
        op.add_column(
            "notification_prefs",
            sa.Column("decision", sa.Boolean(), nullable=False, server_default=sa.true()),
        )

    if "is_chosen" not in _columns("fare_quotes") and _table_exists("fare_quotes"):
        op.add_column(
            "fare_quotes",
            sa.Column("is_chosen", sa.Boolean(), nullable=False, server_default=sa.false()),
        )

    if _table_exists("preferences"):
        op.drop_index("ix_preferences_fare_quote_id", table_name="preferences")
        op.drop_index("ix_preferences_segment_id", table_name="preferences")
        op.drop_index("ix_preferences_user_id", table_name="preferences")
        op.drop_table("preferences")
