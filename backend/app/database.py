import os
from sqlalchemy import create_engine
from sqlalchemy.pool import NullPool
from sqlalchemy.orm import sessionmaker, declarative_base

url = os.getenv("DATABASE_URL", "sqlite:///./pharmacie.db")
if url.startswith("postgres://"):
    url = url.replace("postgres://", "postgresql://", 1)

if url.startswith("sqlite"):
    engine = create_engine(url, connect_args={"check_same_thread": False})
else:
    # En serverless, c'est le pooler de Neon qui gère les connexions
    engine = create_engine(url, poolclass=NullPool, pool_pre_ping=True)

SessionLocal = sessionmaker(bind=engine, autoflush=False)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()