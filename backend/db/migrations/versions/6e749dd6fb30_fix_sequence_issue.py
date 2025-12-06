"""fix sequence issue

Revision ID: 6e749dd6fb30
Revises: 455c98848238

"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "6e749dd6fb30"
down_revision: Union[str, None] = "455c98848238"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.execute("CREATE SEQUENCE users_id_seq OWNED BY users.id")
    op.execute("ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq')")
    op.execute("SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM users))")

    op.execute("CREATE SEQUENCE calls_id_seq OWNED BY calls.id")
    op.execute("ALTER TABLE calls ALTER COLUMN id SET DEFAULT nextval('calls_id_seq')")
    op.execute("SELECT setval('calls_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM calls))")


def downgrade():
    op.execute("DROP SEQUENCE calls_id_seq")
    op.execute("DROP SEQUENCE users_id_seq")
