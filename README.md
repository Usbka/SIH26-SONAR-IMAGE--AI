# Project NayanSagar (नयनसागर)
### Physics-Informed Underwater Debris & Hazard Detection Pipeline for SSS Imagery
**Problem Statement ID:** SIH26057  
**Live Triage Platform:** https://sih-26-sonar-image-ai.vercel.app/

---

## Technical Validation & Benchmarks
- **Architecture:** Custom YOLO11n fine-tuned on Side-Scan Sonar (SSS) SeabedObjects benchmark.
- **Shipwreck / Hazard Detection Performance:** 80.1% mAP@50 | 71.7% Precision | 75.9% Recall.
- **Acoustic Shadow Correlation:** 0.89 (Nadir radial vector matched).
- **Inference Latency:** 62.8 ms on NVIDIA Tesla T4.
- **Physics Shadow Relief Formulation:**
  $$h = \frac{H \cdot L_s}{R + L_s}$$

![Sonar Detection Output](download (3).jpg)
