
from sqlalchemy import Column, Integer, Text
from .dependency import Base


class Round_5(Base):
    __tablename__ = "round_5"

    Team_Name = Column(Text, primary_key=True, index=True)

    abstract = Column(Text, nullable=True)

    score_5 = Column(Integer, nullable=True)

    ppt_link = Column(Text, nullable=True)