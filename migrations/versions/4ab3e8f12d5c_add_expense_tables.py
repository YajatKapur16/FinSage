"""Add expense tables

Revision ID: 4ab3e8f12d5c
Revises: 2e265633197a
Create Date: 2025-03-23 15:30:10.482767

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4ab3e8f12d5c'
down_revision: Union[str, None] = '2e265633197a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema to include expense tables."""
    # Create expense_categories table
    op.create_table('expense_categories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index(op.f('ix_expense_categories_id'), 'expense_categories', ['id'], unique=False)

    # Create expenses table
    op.create_table('expenses',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('category_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['category_id'], ['expense_categories.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_expenses_id'), 'expenses', ['id'], unique=False)


def downgrade() -> None:
    """Downgrade schema by dropping expense tables."""
    # Drop tables in reverse order
    op.drop_index(op.f('ix_expenses_id'), table_name='expenses')
    op.drop_table('expenses')
    op.drop_index(op.f('ix_expense_categories_id'), table_name='expense_categories')
    op.drop_table('expense_categories')