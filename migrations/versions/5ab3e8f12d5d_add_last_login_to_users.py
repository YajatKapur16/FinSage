"""Add last_login to users

Revision ID: 5ab3e8f12d5d
Revises: 4ab3e8f12d5c
Create Date: 2025-03-24 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5ab3e8f12d5d'
down_revision: Union[str, None] = '4ab3e8f12d5c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add last_login column to users table."""
    op.add_column('users', sa.Column('last_login', sa.DateTime(), nullable=True))


def downgrade() -> None:
    """Remove last_login column from users table."""
    op.drop_column('users', 'last_login')