"""switch to integer pks

Revision ID: 455c98848238
Revises: 6b1e4c5ba130

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "455c98848238"
down_revision: Union[str, None] = "6b1e4c5ba130"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Step 1: Add temporary columns
    op.add_column("users", sa.Column("new_id", sa.Integer, nullable=True))
    op.add_column("calls", sa.Column("new_id", sa.Integer, nullable=True))
    op.add_column("calls", sa.Column("new_agent_id", sa.Integer, nullable=True))
    op.add_column("speech_analysis", sa.Column("new_call_id", sa.Integer, nullable=True))

    # Step 2: Populate temporary columns with new integer IDs
    # Users: Use a CTE to assign sequential IDs
    op.execute("""
        WITH numbered AS (
            SELECT id, row_number() OVER (ORDER BY created_at) AS rn
            FROM users
        )
        UPDATE users
        SET new_id = numbered.rn
        FROM numbered
        WHERE users.id = numbered.id
    """)

    # Calls: Assign new_id with a CTE
    op.execute("""
        WITH numbered AS (
            SELECT id, row_number() OVER (ORDER BY created_at) AS rn
            FROM calls
        )
        UPDATE calls
        SET new_id = numbered.rn
        FROM numbered
        WHERE calls.id = numbered.id
    """)

    # Calls: Map new_agent_id to users.new_id
    op.execute("""
        UPDATE calls
        SET new_agent_id = users.new_id
        FROM users
        WHERE calls.agent_id = users.id
    """)

    # SpeechAnalysis: Map new_call_id to calls.new_id
    op.execute("""
        UPDATE speech_analysis
        SET new_call_id = calls.new_id
        FROM calls
        WHERE speech_analysis.call_id = calls.id
    """)

    # Step 3: Drop foreign key constraints
    op.drop_constraint("calls_agent_id_fkey", "calls", type_="foreignkey")
    op.drop_constraint("speech_analysis_call_id_fkey", "speech_analysis", type_="foreignkey")

    # Step 4: Swap columns and set new primary/foreign keys
    # Users
    op.drop_column("users", "id")
    op.alter_column("users", "new_id", nullable=False, new_column_name="id")
    op.create_primary_key("users_pkey", "users", ["id"])

    # Calls
    op.drop_column("calls", "id")
    op.alter_column("calls", "new_id", nullable=False, new_column_name="id")
    op.create_primary_key("calls_pkey", "calls", ["id"])
    op.drop_column("calls", "agent_id")
    op.alter_column("calls", "new_agent_id", nullable=False, new_column_name="agent_id")
    op.create_foreign_key("calls_agent_id_fkey", "calls", "users", ["agent_id"], ["id"])

    # SpeechAnalysis: Only swap call_id (keep id as UUID)
    op.drop_column("speech_analysis", "call_id")
    op.alter_column("speech_analysis", "new_call_id", nullable=False, new_column_name="call_id")
    op.create_foreign_key(
        "speech_analysis_call_id_fkey", "speech_analysis", "calls", ["call_id"], ["id"]
    )


def downgrade():
    # Restore UUID-based schema
    op.add_column("users", sa.Column("id", sa.UUID, nullable=True))
    op.drop_constraint("users_pkey", "users", type_="primary")
    op.alter_column("users", "id", nullable=False, primary_key=True)
    op.drop_column("users", "new_id")

    op.add_column("calls", sa.Column("id", sa.UUID, nullable=True))
    op.drop_constraint("calls_pkey", "calls", type_="primary")
    op.alter_column("calls", "id", nullable=False, primary_key=True)
    op.drop_column("calls", "new_id")
    op.add_column("calls", sa.Column("agent_id", sa.UUID, nullable=True))
    op.drop_constraint("calls_agent_id_fkey", "calls", type_="foreignkey")
    op.alter_column("calls", "agent_id", nullable=False)
    op.create_foreign_key("calls_agent_id_fkey", "calls", "users", ["agent_id"], ["id"])
    op.drop_column("calls", "new_agent_id")

    # SpeechAnalysis: Restore call_id as UUID (id remains UUID, unchanged)
    op.add_column("speech_analysis", sa.Column("call_id", sa.UUID, nullable=True))
    op.drop_constraint("speech_analysis_call_id_fkey", "speech_analysis", type_="foreignkey")
    op.alter_column("speech_analysis", "call_id", nullable=False)
    op.create_foreign_key(
        "speech_analysis_call_id_fkey", "speech_analysis", "calls", ["call_id"], ["id"]
    )
    op.drop_column("speech_analysis", "new_call_id")
