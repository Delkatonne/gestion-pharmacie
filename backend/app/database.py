import os
from sqlalchemy import create_engine
from sqlalchemy.pool import NullPool
from sqlalchemy.orm import sessionmaker, declarative_base

url = os.getenv("DATABASE_URL", "sqlite:///./pharmacie.db")

# Force le driver installé (psycopg2), même si l'URL indique postgresql+psycopg://
for prefix in ("postgres://", "postgresql://", "postgresql+psycopg://"):
    if url.startswith(prefix):
        url = "postgresql+psycopg2://" + url[len(prefix):]
        break

if url.startswith("sqlite"):
    engine = create_engine(url, connect_args={"check_same_thread": False})
else:
    engine = create_engine(url, poolclass=NullPool, pool_pre_ping=True)

SessionLocal = sessionmaker(bind=engine, autoflush=False)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()