import cloudinary.uploader
import cloudinary.api
import cloudinary
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from fastapi import UploadFile

load_dotenv()
from models.round_3 import Round_3
from service.leaderboard_service import update_leaderboard_score


cloudinary.config(
    cloud_name="djuxe9v6i",
    api_key="294965439351471",
    api_secret="RcLN-zB3w_C0S9UtTQYmNbl1-Kg"
)

async def submit_round_3_service(
    db: AsyncSession,
    Team_Name: str,
    figma_links: str,
    description: str,
    status_3: str ,
    score_3: int,
    files: List[UploadFile]
):
    uploaded_urls = []

    for file in files:
        result = cloudinary.uploader.upload(
            file.file,
            resource_type="auto"
        )

        uploaded_urls.append(result["secure_url"])

    # store as comma-separated OR JSON (depending on your model)
    ss_links = ",".join(uploaded_urls)

    event = Round_3(
        Team_Name=Team_Name,
        figma_links=figma_links,
        ss_links_round_3=ss_links,
        description=description,
        status_3=status_3,
        score_3=score_3
    )

    db.add(event)
    await db.commit()
    await db.refresh(event)

    # Update leaderboard score
    await update_leaderboard_score(db, Team_Name)

    return event, uploaded_urls

        