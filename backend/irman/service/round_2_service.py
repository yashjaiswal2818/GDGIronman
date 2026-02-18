import cloudinary.uploader
import cloudinary.api
import cloudinary
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from fastapi import UploadFile

load_dotenv()
from models.round_2 import Round_2


cloudinary.config(
    cloud_name="djuxe9v6i",
    api_key="294965439351471",
    api_secret="RcLN-zB3w_C0S9UtTQYmNbl1-Kg"
)

async def submit_round_2_service(
    db: AsyncSession,
    Team_Name: str,
    git_hub_link: str,
    hosted_link: str,
    status: str,
    score_2: int,
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

    event = Round_2(
        Team_Name=Team_Name,
        git_hub_link=git_hub_link,
        hosted_link=hosted_link,
        ss_links=ss_links,
        status="Submitted",
        score_2=score_2,
    )

    db.add(event)
    await db.commit()
    await db.refresh(event)

    return event, uploaded_urls
