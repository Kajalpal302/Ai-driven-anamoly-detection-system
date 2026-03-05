from sklearn.ensemble import IsolationForest
import joblib
import os


def train_isolation_forest(X_train):

    iso_model = IsolationForest(
        n_estimators=100,
        contamination=0.05,
        random_state=42
    )

    iso_model.fit(X_train)

     # Get absolute path to ml/models
    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    MODEL_DIR = os.path.join(BASE_DIR, "models")
    os.makedirs(MODEL_DIR, exist_ok=True)

    joblib.dump(iso_model, os.path.join(MODEL_DIR, "isolation_forest.pkl"))

    return iso_model
