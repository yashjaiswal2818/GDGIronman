from sqlalchemy import Column, Integer, Text
from sqlalchemy.dialects.postgresql import JSONB
from .dependency import Base

class Round_3(Base):
    __tablename__ = "round_3"

    Team_Name = Column(Text, primary_key=True, index=True)

    figma_links = Column(Text, nullable=False, index=True)

    ss_links_round_3 = Column(Text, nullable=True)

    description = Column(Text, nullable=True)
    
    status_3 = Column(Text, nullable=True)

    feedback_3 = Column(Text, nullable=True)
    score_3 = Column(Integer, nullable=True)