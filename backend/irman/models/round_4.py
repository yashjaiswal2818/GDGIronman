from sqlalchemy import Column, Integer, Text
from sqlalchemy.dialects.postgresql import JSONB
from .dependency import Base

class Round_4(Base):
    __tablename__ = "round_4"

    Team_Name = Column(Text, primary_key=True, index=True)

    structured_submission = Column(Text, nullable=False, index=True)

    status_4 = Column(Text, nullable=True)

    question = Column(Text, nullable=True)

    score_4 = Column(Integer, nullable=True)
    