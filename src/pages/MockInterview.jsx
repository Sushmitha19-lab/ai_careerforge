import React, { useEffect, useRef, useState } from "react";

const questionBank = {
  Easy: [
    "What is a list in Python?",
    "What is the difference between a list and a tuple?",
  ],

  Medium: [
    "Explain the difference between supervised and unsupervised learning.",
    "What is overfitting and how can you prevent it?",
  ],

  Hard: [
    "Explain how you would design a machine learning pipeline for a real-world classification problem.",
    "How would you evaluate whether a machine learning model is suitable for production?",
  ],
};

function MockInterview({
  company,
  course,
  onBack,
  onFinish,
}) {
  const [difficulty, setDifficulty] = useState("Easy");
  const [questionIndex, setQuestionIndex] = useState(0);

  const [answer, setAnswer] = useState("");

  const [answers, setAnswers] = useState([]);

  const [cameraOpen, setCameraOpen] = useState(false);

  const [listening, setListening] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const questions = questionBank[difficulty];

  const question = questions[questionIndex];

  const progress =
    ((questionIndex + 1) / questions.length) * 100;


  /* CAMERA */

  const toggleCamera = async () => {

    if (cameraOpen) {

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }

      streamRef.current = null;
      setCameraOpen(false);

      return;
    }

    try {

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

      streamRef.current = stream;

      setCameraOpen(true);

      setTimeout(() => {

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

      }, 100);

    } catch (error) {

      alert(
        "Camera permission was not granted."
      );

    }
  };


  /* VOICE INPUT */

  const voiceInput = () => {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

      alert(
        "Voice input is not supported in this browser. Try Google Chrome."
      );

      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.continuous = false;

    recognition.interimResults = false;


    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onresult = (event) => {

      const text =
        event.results[0][0].transcript;

      setAnswer((previous) =>
        previous
          ? `${previous} ${text}`
          : text
      );

    };

    recognition.start();
  };


  /* CLEAN CAMERA */

  useEffect(() => {

    return () => {

      if (streamRef.current) {

        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());

      }

    };

  }, []);


  /* ADAPTIVE DIFFICULTY */

  const calculateScore = (text) => {

    if (!text.trim()) {
      return 0;
    }

    const words =
      text.trim().split(/\s+/).length;

    if (words < 8) {
      return 45;
    }

    if (words < 20) {
      return 65;
    }

    if (words < 40) {
      return 78;
    }

    return 88;
  };


  const submitAnswer = () => {

    const score = calculateScore(answer);

    const newAnswer = {
      question,
      answer,
      score,
      difficulty,
    };

    const updatedAnswers = [
      ...answers,
      newAnswer,
    ];

    setAnswers(updatedAnswers);

    if (score >= 75 && difficulty === "Easy") {

      setDifficulty("Medium");
      setQuestionIndex(0);
      setAnswer("");

      return;
    }

    if (score >= 80 && difficulty === "Medium") {

      setDifficulty("Hard");
      setQuestionIndex(0);
      setAnswer("");

      return;
    }

    if (
      questionIndex <
      questions.length - 1
    ) {

      setQuestionIndex(
        questionIndex + 1
      );

      setAnswer("");

      return;
    }

    finishInterview(updatedAnswers);
  };


  const finishInterview = (finalAnswers = answers) => {

    if (
      finalAnswers.length === 0 &&
      answer.trim()
    ) {

      finalAnswers = [
        {
          question,
          answer,
          score: calculateScore(answer),
          difficulty,
        },
      ];

    }

    const scores =
      finalAnswers.map((item) => item.score);

    const average =
      scores.length > 0
        ? Math.round(
            scores.reduce(
              (a, b) => a + b,
              0
            ) / scores.length
          )
        : 0;

    const technical =
      Math.min(100, average + 4);

    const communication =
      Math.min(100, average + 8);

    const problemSolving =
      Math.max(0, average - 3);

    onFinish({
      overall: average,
      technical,
      communication,
      problemSolving,
      answers: finalAnswers,
    });
  };


  return (
    <div className="interview-page">

      <header className="interview-header">

        <button
          className="back-button"
          onClick={onBack}
        >
          ← Preparation
        </button>

        <div className="interview-brand">
          <div className="brand-mark">C</div>

          <strong>
            CareerForge
          </strong>
        </div>

        <span className="interview-company">
          {company?.name} · {course?.name}
        </span>

      </header>


      <main className="interview-container">

        <div className="interview-heading">

          <div>

            <p className="eyebrow">
              MOCK INTERVIEW
            </p>

            <h1>
              Technical Question
            </h1>

            <p>
              {difficulty} difficulty
            </p>

          </div>

          <button
            className="end-button"
            onClick={() => finishInterview()}
          >
            End Interview
          </button>

        </div>


        <div className="interview-progress">

          <div
            className="progress-fill"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>


        <div className="question-meta">
          Question {questionIndex + 1} of{" "}
          {questions.length}
        </div>


        <section className="question-card">

          <h2>
            {question}
          </h2>


          <textarea
            value={answer}
            onChange={(e) =>
              setAnswer(e.target.value)
            }
            placeholder="Type your answer here..."
          />


          <div className="interview-tools">

            <button
              className={
                listening
                  ? "tool-button active-tool"
                  : "tool-button"
              }
              onClick={voiceInput}
            >
              🎤{" "}
              {listening
                ? "Listening..."
                : "Voice Input"}
            </button>


            <button
              className="tool-button camera-button"
              onClick={toggleCamera}
            >
              📷{" "}
              {cameraOpen
                ? "Close Camera"
                : "Open Camera"}
            </button>

          </div>


          {cameraOpen && (

            <div className="camera-box">

              <video
                ref={videoRef}
                autoPlay
                muted
              />

              <span>
                Camera active
              </span>

            </div>

          )}


          <div className="communication">

            Communication Indicator:{" "}

            <strong>
              {answer.length > 30
                ? "Good"
                : "Normal"}
            </strong>

          </div>


          <button
            className="submit-answer"
            onClick={submitAnswer}
          >
            {questionIndex === questions.length - 1
              ? "Submit & View Result"
              : "Submit Answer →"}
          </button>

        </section>

      </main>

    </div>
  );
}

export default MockInterview;