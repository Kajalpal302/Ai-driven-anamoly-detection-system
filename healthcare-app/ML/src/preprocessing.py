import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
import joblib
import os


def generate_synthetic_data(n=5000):
    np.random.seed(42)

    data = pd.DataFrame({
        "heart_rate": np.random.normal(75, 10, n),
        "spo2": np.random.normal(98, 1, n),
        "temperature": np.random.normal(98.6, 0.5, n),
        "systolic_bp": np.random.normal(120, 10, n),
        "diastolic_bp": np.random.normal(80, 5, n)
    })

    # Inject anomalies
    anomaly_indices = np.random.choice(n, size=int(0.05 * n))
    data.loc[anomaly_indices, "heart_rate"] = np.random.uniform(40, 150, len(anomaly_indices))
    data.loc[anomaly_indices, "spo2"] = np.random.uniform(85, 92, len(anomaly_indices))
    data.loc[anomaly_indices, "temperature"] = np.random.uniform(101, 104, len(anomaly_indices))

    return data


def scale_data(data):
    scaler = StandardScaler()
    scaled = scaler.fit_transform(data)

    # Get absolute path to ml/models
    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    MODEL_DIR = os.path.join(BASE_DIR, "models")
    os.makedirs(MODEL_DIR, exist_ok=True)

    joblib.dump(scaler, os.path.join(MODEL_DIR, "scaler.pkl"))

    return scaled
