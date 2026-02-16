from fastapi import UploadFile, File, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import cloudinary
import cloudinary.uploader
from typing import List
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
cloudinary.config(
    cloud_name='dokzyijqo',
    api_key='519149328713126',
    api_secret='LLeSvMpg1xwzdvtPNp4w6dmTnvs'
)
@app.post("/upload-multiple/")
async def upload_images(files: List[UploadFile] = File(...)):

    uploaded_urls = []

    for file in files:

        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(400, "Only images allowed")

        contents = await file.read()

        result = cloudinary.uploader.upload(
            contents,
            folder="contest_uploads"
        )

        uploaded_urls.append(result["secure_url"])

    return {
        "message": "All uploads successful",
        "images": uploaded_urls
    }