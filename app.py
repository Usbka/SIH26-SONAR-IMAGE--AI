import base64
from datetime import datetime, timezone
from pathlib import Path

import cv2
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from core.inference import run_pipeline

ROOT = Path(__file__).resolve().parent
WEIGHTS = ROOT / "models" / "best.pt"
ALLOWED_TYPES = {"image/png", "image/jpeg"}

app = FastAPI(title="NayanSagar Edge AI API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def encode_image(image: np.ndarray) -> str:
    success, encoded = cv2.imencode(".jpg", image)
    if not success:
        raise HTTPException(status_code=500, detail="Could not encode annotated image")
    return "data:image/jpeg;base64," + base64.b64encode(encoded.tobytes()).decode("ascii")


@app.get("/health")
def health():
    return {"status": "ok", "model": str(WEIGHTS.name), "weights_present": WEIGHTS.exists()}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=415, detail="Upload a PNG or JPG sonar image")
    if not WEIGHTS.exists():
        raise HTTPException(status_code=503, detail="models/best.pt is unavailable")

    payload = await file.read()
    image = cv2.imdecode(np.frombuffer(payload, dtype=np.uint8), cv2.IMREAD_COLOR)
    if image is None:
        raise HTTPException(status_code=400, detail="The uploaded file is not a readable image")

    temporary_path = ROOT / ".nayan_upload.jpg"
    cv2.imwrite(str(temporary_path), image)
    try:
        annotated, detections = run_pipeline(str(temporary_path), str(WEIGHTS))
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error)) from error
    finally:
        temporary_path.unlink(missing_ok=True)

    timestamp = datetime.now(timezone.utc).isoformat()
    for detection in detections:
        detection["timestamp"] = timestamp
        detection["coordinates"] = detection.pop("bbox")

    return {
        "timestamp": timestamp,
        "filename": file.filename,
        "detections": detections,
        "annotated_image": encode_image(annotated),
    }