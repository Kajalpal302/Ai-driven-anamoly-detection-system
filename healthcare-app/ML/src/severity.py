def classify_severity(iso_score, mse_score, threshold):

    if iso_score < -0.1 or mse_score > threshold * 1.5:
        return "HIGH"
    elif iso_score < 0 or mse_score > threshold:
        return "MEDIUM"
    else:
        return "LOW"
