from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from models.leaderboard import Leaderboard   # your model

async def get_records_desc(db: AsyncSession):

    result = await db.execute(
        select(Leaderboard).order_by(desc(Leaderboard.team_score))
    )

    records = result.scalars().all()

    return records
