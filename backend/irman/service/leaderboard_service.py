from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from models.leaderboard import Leaderboard
from models.model import Registration
from models.round_2 import Round_2
from models.round_3 import Round_3
from models.round_4 import Round_4
from models.round_5 import Round_5


async def get_records_desc(db: AsyncSession):
    """
    Get all registered teams with their scores, sorted by score descending.
    Includes all registered teams, even if they haven't submitted anything (score = 0).
    """
    # Get all registered teams
    registration_result = await db.execute(select(Registration))
    all_teams = registration_result.scalars().all()
    
    # Get all leaderboard entries
    leaderboard_result = await db.execute(select(Leaderboard))
    leaderboard_dict = {entry.Team_Name: entry.team_score for entry in leaderboard_result.scalars().all()}
    
    # Create records for all registered teams with their scores
    records = []
    for team in all_teams:
        team_name = team.Team_Name
        score = leaderboard_dict.get(team_name, 0)  # Use 0 if no leaderboard entry exists
        
        # Create a dictionary matching Leaderboard model structure
        record = {
            "Team_Name": team_name,
            "team_score": score
        }
        records.append(record)
    
    # Sort by score descending
    records.sort(key=lambda x: x["team_score"], reverse=True)
    
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
