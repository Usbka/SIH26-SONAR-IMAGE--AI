import cv2
from ultralytics import YOLO

from core.physics_engine import calculate_shadow_relief


def _shadow_correlation(image, box):
    """Estimate how strongly the dark return beside a target resembles a shadow."""
    x1, y1, x2, y2 = [max(0, int(value)) for value in box]
    height, width = image.shape[:2]
    if x2 <= x1 or y2 <= y1:
        return 0.0

    shadow_start = min(width, x2)
    shadow_end = min(width, x2 + max(1, x2 - x1))
    target = image[y1:y2, x1:x2]
    shadow = image[y1:y2, shadow_start:shadow_end]
    if target.size == 0 or shadow.size == 0:
        return 0.0

    target_darkness = 1.0 - float(target.mean()) / 255.0
    shadow_darkness = 1.0 - float(shadow.mean()) / 255.0
    return round(max(0.0, min(1.0, (target_darkness + shadow_darkness) / 2.0)), 2)


def run_pipeline(image_path: str, weights_path: str = "models/best.pt", altitude_H: float = 12.5):
    model = YOLO(weights_path)
    result = model.predict(image_path, conf=0.25, verbose=False)[0]
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Could not read image: {image_path}")

    detections = []
    for box in result.boxes:
        coordinates = box.xyxy[0].cpu().numpy().tolist()
        x1, y1, x2, y2 = coordinates
        confidence = float(box.conf[0])
        class_id = int(box.cls[0])
        class_name = result.names[class_id]

        contact_width = max(0.0, x2 - x1)
        slant_range = float(x1 * 0.12 + 8.5)
        shadow_length = float(contact_width * 0.32)
        relief = calculate_shadow_relief(altitude_H, shadow_length, slant_range)
        correlation = _shadow_correlation(image, coordinates)

        detections.append({
            "class": class_name,
            "confidence": round(confidence, 4),
            "relief_m": round(relief, 2),
            "shadow_correlation": correlation,
            "bbox": [round(float(value), 2) for value in coordinates],
            "hazard_status": "HIGH" if relief >= 5 or confidence >= 0.8 else "REVIEW",
        })

    annotated = result.plot(labels=True, conf=True, line_width=2)
    return annotated, detections
