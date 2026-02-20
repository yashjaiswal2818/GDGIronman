from pydantic import BaseModel
from typing import List, Dict, Any


class Submission(BaseModel):
    Team_Name: str
    contest_id: str
    problem_id: int
    code: str
    status: str  # "Accepted" or "Rejected"
    score: int = 0  # Points earned (5 per test case passed)


#submission_id = Column(Integer, primary_key=True, index=True)
#
#    Team_Name = Column(Text, nullable=True, index=True)
#
#    contest_id = Column(Text, index=True)
#
#    problem_id = Column( Integer, nullable=False, index=True )
#
#    code = Column(Text, nullable=False)
#
#    status = Column(Text, nullable=True)  
