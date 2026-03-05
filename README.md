##Overview
The AI-driven Healthcare Anamoly detection system is an end-to-end real-time monitoring and decison-aupport
platform designed to detect abnormal patterns in patient vital signs and generate early health risk alerts.

#Description
The system ingests real-time patient vitals such as heart rate, oxygen saturation (SpO₂), body temperature, 
and blood pressure through a streaming pipeline powered by Apache Kafka. These vitals are processed by advanced
anomaly detection models, including an Autoencoder Neural Network and Isolation Forest, which compute anomaly scores and
classify patient conditions into severity levels such as LOW, MEDIUM, and HIGH.

Detected anomalies are stored in a PostgreSQL database, visualized on an interactive Flask-based dashboard, and critical alerts
automatically trigger email notifications to healthcare administrators. The project demonstrates the practical application of machine learning,
real-time data streaming, backend APIs, and dashboard visualization in solving real-world healthcare monitoring challenges.

#Technical structure
1)Install Python, required libraries, Apache Kafka, and PostgreSQL, and configure the environment.

2)Set up Kafka producers to stream real-time patient vital signs data.

3)Configure Kafka consumers to receive and process live physiological data.

4)Load and integrate anomaly detection models (Autoencoder and Isolation Forest).

5)Preprocess incoming vitals and compute anomaly scores in real time.

6)Classify patient health conditions into LOW, MEDIUM, and HIGH severity levels.

7)Store patient vitals, anomaly scores, and severity details in PostgreSQL.

8)Develop Flask-based APIs to serve real-time and historical monitoring data.

9)Build an interactive dashboard to visualize vitals, anomalies, and alerts.

10)Trigger automated email notifications for HIGH-severity health anomalies.

