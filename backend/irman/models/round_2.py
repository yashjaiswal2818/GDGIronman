from sqlalchemy import Column, Integer, Text
from sqlalchemy.dialects.postgresql import JSONB
from .dependency import Base

class Round_2(Base):
    __tablename__ = "round_2"

    Team_Name = Column(Text, primary_key=True, index=True)

    git_hub_link = Column(Text, nullable=False, index=True)

    hosted_link = Column(Text, nullable=True)

    ss_links = Column(Text, nullable=True)

    status = Column(Text, nullable=True)

    score_2 = Column(Integer, nullable=True)
    