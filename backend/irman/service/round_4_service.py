from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from fastapi import UploadFile

load_dotenv()
from models.round_4 import Round_4
from service.leaderboard_service import update_leaderboard_score


async def submit_round_4_service(
    db: AsyncSession,
    Team_Name: str,
    structured_submission: str,
    status_4: str,
    question: str,
    score_4: int,
):
    

    event = Round_4(
        Team_Name=Team_Name,
        structured_submission=structured_submission,
        status_4=status_4,
        question=question,
        score_4=score_4,
    )

    db.add(event)
    await db.commit()
    await db.refresh(event)

    # Update leaderboard score
    await update_leaderboard_score(db, Team_Name)

    return event
