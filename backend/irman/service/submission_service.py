from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.submissions import Submission


async def submission_service(
    db: AsyncSession,
    Team_Name: str,
    contest_id: str,
    problem_id: int,
    code: str,
    status: str,
    score: int = 0
):
    # Create submission object
    new_submission = Submission(
        Team_Name=Team_Name,
        contest_id=contest_id,
        problem_id=problem_id,
        code=code,
        status=status,
        score=score
    )

    # Save to DB
    db.add(new_submission)

    await db.commit()
    await db.refresh(new_submission)

    return {"message": "Submission created", "submission_id": new_submission.submission_id}



