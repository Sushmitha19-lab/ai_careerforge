from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)


# Load trained ML model
model = joblib.load("skill_assessment_model.pkl")

# Load label encoder
encoder = joblib.load("label_encoder.pkl")


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "CareerForge ML Service Running"
    })


@app.route("/predict", methods=["POST"])
def predict():

    data = request.json

    technical_score = data["technical_score"]
    communication_score = data["communication_score"]
    problem_solving = data["problem_solving"]

    features = [[
        technical_score,
        communication_score,
        problem_solving
    ]]

    prediction = model.predict(features)

    skill_level = encoder.inverse_transform(prediction)[0]

    return jsonify({
        "skill_level": skill_level
    })


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5001,
        debug=True
    )