from pydantic import BaseModel

class Round_4_Submit(BaseModel):
    Team_Name: str
    structured_submission: str
    status_4: str
    question: str
    score_4: int