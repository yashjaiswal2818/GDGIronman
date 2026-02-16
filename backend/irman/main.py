from datetime import datetime
from fastapi import APIRouter, Depends, FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from db import get_db
from models.model import Registration
from models.contests import Contest
from models.probelms import Problem
from service.registration_service import registration_service
from service.contest_service import create_contest
from service.submission_service import submission_service
from service.problems_service import create_problem
from schemas.problem_schema import ProblemCreate
from schemas.contest_schema import ContestCreate
from schemas.registration_schema import RegistrationCreate
from schemas.submission_schema import Submission
from service.problems_service import get_problem_by_id

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your frontend origin

   # allow_origins=
    #    "http://127.0.0.1:5500",
    #    "http://localhost:5500",
    #    "http://127.0.0.1:3000",
    #    "http://localhost:3000",
    #],  '''
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/register")
async def register_team(registration: RegistrationCreate, db: AsyncSession = Depends(get_db)):
    res = await registration_service(registration.Team_Name, team_members=[mem.dict() for mem in registration.team_members], db=db)
    return res


@app.post("/contest")
async def api_create_contest(
    contest: ContestCreate,
    db: AsyncSession = Depends(get_db)
):
    return await create_contest(
        db,
        contest.contest_id,
        contest.description,
        contest.start_time,
        contest.end_time
    )


@app.post("/problem")
async def api_create_problem(
    problem: ProblemCreate,
    db: AsyncSession = Depends(get_db)
):
    new_problem = Problem(
        contest_id=problem.contest_id,
        title=problem.title,
        description=problem.description,
        test_cases=[tc.dict() for tc in problem.test_cases],
        score=problem.score,
        post_code=[poc.dict() for poc in problem.post_code],
        pre_code=[prc.dict() for prc in problem.pre_code]
    )

    db.add(new_problem)

    await db.commit()
    await db.refresh(new_problem)

    return {
        "message": "Problem created successfully",
        "problem_id": new_problem.problem_id
    }


@app.post("/submit")
async def api_new_submission(
    submission: Submission,
    db: AsyncSession = Depends(get_db)
):
    return await submission_service(
        db,
        submission.Team_Name,
        submission.contest_id,
        submission.problem_id,
        submission.code,
        submission.status
    )
@app.get("/problem/{problem_id}")
async def api_get_problem(
    problem_id: int,
    db: AsyncSession = Depends(get_db)
):
    return await get_problem_by_id(db, problem_id)  
    # team = Registration(
    #    Team_Name=team_name,
    #    team_members=team_members
    # )
    # db.add(team)
    # await db.commit()
    # return {"message": "Team registered"}


# "members": [
#                {"name": "Aryan", "role": "Leader", "email" : "aryan@example.com"},
#                {"name": "John", "role": "member", "email" : "john@example.com"},
#                {"name": "Jane", "role": "member", "email" : "jane@example.com"}
#
#            ]
