# AI Healthcare Anomaly Detection System

An ML-based anomaly detection system using:

- Isolation Forest
- Autoencoder
- Severity classification logic

## Features

- Synthetic patient data generation
- Data scaling
- Anomaly detection
- Severity classification (LOW / MEDIUM / HIGH)
- Inference pipeline

## Project Structure

```
ml/
  ├── src/
  ├── inference/
  ├── models/
  └── notebooks/
```

## How to Run

1. Install dependencies:
   pip install -r requirements.txt

2. Train models:
   Run anomaly_training.ipynb

3. Run inference:
   python -m ml.inference.predict

## Output Example

{
  "severity": "LOW",
  "is_anomaly": false,
  "anomaly_score": 0.00022,
  "iso_score": 0.20
}