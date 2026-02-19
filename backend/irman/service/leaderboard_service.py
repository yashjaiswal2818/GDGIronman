from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from models.leaderboard import Leaderboard
from models.round_2 import Round_2
from models.round_3 import Round_3
from models.round_4 import Round_4
from models.round_5 import Round_5


async def get_records_desc(db: AsyncSession):
    result = await db.execute(
        select(Leaderboard).order_by(desc(Leaderboard.team_score))
    )
    records = result.scalars().all()
    return records


async def update_leaderboard_score(db: AsyncSession, team_name: str):
    """
    Calculate total score from all rounds and update leaderboard.
    Score calculation:
    - Round 2: score_2 (default 0)
    - Round 3: score_3 (default 0)
    - Round 4: score_4 (default 0)
    - Round 5: score_5 (default 0)
    Total = sum of all round scores
    """
    # Fetch scores from each round table
    round_2_result = await db.execute(
        select(Round_2.score_2).where(Round_2.Team_Name == team_name)
    )
    score_2 = round_2_result.scalar_one_or_none() or 0

    round_3_result = await db.execute(
        select(Round_3.score_3).where(Round_3.Team_Name == team_name)
    )
    score_3 = round_3_result.scalar_one_or_none() or 0

    round_4_result = await db.execute(
        select(Round_4.score_4).where(Round_4.Team_Name == team_name)
    )
    score_4 = round_4_result.scalar_one_or_none() or 0

    round_5_result = await db.execute(
        select(Round_5.score_5).where(Round_5.Team_Name == team_name)
    )
    score_5 = round_5_result.scalar_one_or_none() or 0

    # Calculate total score
    total_score = score_2 + score_3 + score_4 + score_5

    # Check if leaderboard entry exists
    leaderboard_result = await db.execute(
        select(Leaderboard).where(Leaderboard.Team_Name == team_name)
    )
    leaderboard_entry = leaderboard_result.scalar_one_or_none()

    if leaderboard_entry:
        # Update existing entry
        leaderboard_entry.team_score = total_score
    else:
        # Create new entry
        leaderboard_entry = Leaderboard(
            Team_Name=team_name,
            team_score=total_score
        )
        db.add(leaderboard_entry)

    await db.commit()
    await db.refresh(leaderboard_entry)
    return leaderboard_entry
