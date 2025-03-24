from logging.config import fileConfig
import os
from sqlalchemy import create_engine, pool
from alembic import context

# Import your SQLAlchemy models
from app.database import Base  # Adjust this import based on your project structure
from app.auth.models import User  # Explicitly import models
from app.forum.models import Thread
from app.forum.models import Reply
from app.expense.models import Expense, ExpenseCategory  # Add expense models

# Alembic Config object
config = context.config

# Interpret the config file for logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set up metadata for 'autogenerate' support
target_metadata = Base.metadata

# Get database URL from environment or use default for local development
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://dev:devpass@localhost:5432/finsage")


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = create_engine(DATABASE_URL, poolclass=pool.NullPool)

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
