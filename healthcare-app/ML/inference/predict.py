import sys
import os

# Add project root to Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

import joblib
import numpy as np
from tensorflow.keras.models import load_model
from ml.src.severity import classify_severity

# Load everything once
scaler = joblib.load("ml/models/scaler.pkl")
iso_model = joblib.load("ml/models/isolation_forest.pkl")
autoencoder = load_model("ml/models/autoencoder.h5", compile=False)
threshold = joblib.load("ml/models/threshold.pkl")


def predict(vitals_array):
    """
    vitals_array format:
    [heart_rate, spo2, temperature, systolic_bp, diastolic_bp]
    """

    scaled = scaler.transform([vitals_array])

    iso_score = iso_model.decision_function(scaled)[0]

    reconstruction = autoencoder.predict(scaled, verbose=0)
    mse = np.mean(np.power(scaled - reconstruction, 2))

    severity = classify_severity(iso_score, mse, threshold)

    return {
        "severity": severity,
        "is_anomaly": severity != "LOW",
        "anomaly_score": float(mse),
        "iso_score": float(iso_score)
    }

if __name__ == "__main__":
    # Example patient vitals
    sample_input = [75, 98, 98.6, 120, 80]  # HR, SpO2, Temp, SysBP, DiaBP

    result = predict(sample_input)
    print("Prediction Result:", result)
