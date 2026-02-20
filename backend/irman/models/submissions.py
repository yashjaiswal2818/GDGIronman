from sqlalchemy import Column, Integer, Text, ForeignKey
from .dependency import Base


class Submission(Base):
    __tablename__ = "submissions"

    submission_id = Column(Integer, primary_key=True, index=True)

    Team_Name = Column(Text, nullable=True, index=True)

    contest_id = Column(Text, index=True)

    problem_id = Column( Integer, nullable=False, index=True )

    code = Column(Text, nullable=False)

    status = Column(Text, nullable=True)

    score = Column(Integer, nullable=True, default=0)  

    