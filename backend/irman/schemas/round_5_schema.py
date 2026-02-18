from pydantic import BaseModel

class Round_5_Submit(BaseModel):
    Team_Name: str
    abstract: str
    score_5: int   