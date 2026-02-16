import os
from pathlib import Path
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load .env from backend/irman/ so it works regardless of cwd
_env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(_env_path)

# Use DATABASE_URL_LOCAL when Neon is unreachable (e.g. "nodename nor servname" / DNS).
# Example: postgresql+asyncpg://user:pass@127.0.0.1:5432/registration
DATABASE_URL = os.getenv("DATABASE_URL_LOCAL") or os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. Add it to backend/irman/.env or set the env var. "
        "Example: postgresql+asyncpg://user:pass@host/dbname?ssl=require"
    )

engine = create_async_engine(
    DATABASE_URL,
    echo=True,
    pool_pre_ping=True,
)

AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

'''
LANG_CONFIG = {
    "python": {
        "language": "python",
        "version": "3.10.0",
        "filename": "main.py"
    },
    "cpp": {
        "language": "cpp",
        "version": "10.2.0",
        "filename": "main.cpp"
    },
    "java": {
        "language": "java",
        "version": "15.0.2",
        "filename": "Main.java"
    },
    "c": {
        "language": "c",
        "version": "10.2.0",
        "filename": "main.c"
    },
    "javascript": {
        "language": "javascript",
        "version": "18.15.0",
        "filename": "main.js"
    }
}'''