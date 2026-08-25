import { useState, useRef, useEffect } from "react";

function App() {
  // =========================
  // BACKEND CONNECTION
  // =========================

  useEffect(() => {
    fetch("http://localhost:5000")
      .then((res) => res.text())
      .then((data) => {
        console.log("Backend:", data);
      })
      .catch((error) => {
        console.log("Backend not connected:", error);
      });
  }, []);

  // =========================
  // COURSE DATA
  // =========================

  const courses = [
    {
      id: 1,
      name: "Artificial Intelligence & Machine Learning",
      shortName: "AI / ML",
    },
    {
      id: 2,
      name: "Data Science",
      shortName: "Data Science",
    },
    {
      id: 3,
      name: "Web Development",
      shortName: "Web Development",
    },
    {
      id: 4,
      name: "Cybersecurity",
      shortName: "Cybersecurity",
    },
    {
      id: 5,
      name: "Cloud Computing",
      shortName: "Cloud Computing",
    },
  ];

  // =========================
  // COMPANY DATA
  // =========================

  const companies = {
    "AI / ML": [
      "Company A",
      "Company B",
      "Company C",
      "Company D",
      "Company E",
    ],

    "Data Science": [
      "Company F",
      "Company G",
      "Company H",
      "Company I",
      "Company J",
    ],

    "Web Development": [
      "Company K",
      "Company L",
      "Company M",
      "Company N",
      "Company O",
    ],

    Cybersecurity: [
      "Company P",
      "Company Q",
      "Company R",
      "Company S",
      "Company T",
    ],

    "Cloud Computing": [
      "Company U",
      "Company V",
      "Company W",
      "Company X",
      "Company Y",
    ],
  };

  // =========================
  // INTERVIEW DATA
  // =========================

  const interviewRounds = [
    "Aptitude",
    "Coding",
    "Technical Interview",
    "HR Interview",
  ];

  const resources = [
    {
      title: "NPTEL Learning Resources",
      type: "NPTEL",
      link: "https://nptel.ac.in/",
    },
    {
      title: "YouTube Learning Resources",
      type: "Video",
      link: "https://www.youtube.com/",
    },
  ];

  // =========================
  // QUESTIONS
  // =========================

  const questions = [
    {
      type: "Technical",
      question: "What is a list in Python?",
      keywords: ["ordered", "mutable", "collection"],
    },

    {
      type: "Technical",
      question: "What is the difference between list and tuple?",
      keywords: ["mutable", "immutable", "ordered"],
    },

    {
      type: "HR",
      question: "Why do you want to learn Python?",
      keywords: ["career", "development", "automation"],
    },

    {
      type: "HR",
      question: "Tell me about your strengths.",
      keywords: ["communication", "teamwork", "confidence"],
    },
  ];

  // =========================
  // PAGE STATE
  // =========================

  const [page, setPage] = useState("login");

  // =========================
  // USER DETAILS
  // =========================

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");

  // =========================
  // COURSE / COMPANY
  // =========================

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");

  // =========================
  // INTERVIEW STATES
  // =========================

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [weakAreas, setWeakAreas] = useState([]);
  const [emotion, setEmotion] = useState("Normal");

  // =========================
  // CAMERA
  // =========================

  const videoRef = useRef(null);

  // =========================
  // LOGIN
  // =========================

  const handleLogin = () => {
    if (!name || !email || !mobile) {
      alert("Please fill all fields");
      return;
    }

    setPage("dashboard");
  };

  // =========================
  // SELECT COURSE
  // =========================

  const selectCourse = (courseName) => {
    setSelectedCourse(courseName);
    setSelectedCompany("");
    setPage("companies");
  };

  // =========================
  // SELECT COMPANY
  // =========================

  const selectCompany = (companyName) => {
    setSelectedCompany(companyName);
    setPage("company");
  };

  // =========================
  // START INTERVIEW
  // =========================

  const startInterview = () => {
    setCurrentQuestion(0);
    setAnswer("");
    setScore(0);
    setFeedback("");
    setWeakAreas([]);
    setEmotion("Normal");

    setPage("interview");
  };

  // =========================
  // VOICE INPUT
  // =========================

  const startVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;

      setAnswer(transcript);

      // Temporary placeholder.
      // Actual voice/fluency ML will be added later.
      if (transcript.length < 15) {
        setEmotion("Needs Improvement");
      } else {
        setEmotion("Good");
      }
    };
  };

  // =========================
  // CAMERA
  // =========================

  const openCamera = async () => {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
        });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.log(error);
      alert("Camera access denied.");
    }
  };

  // =========================
  // ANSWER EVALUATION
  // =========================

  const evaluateAnswer = () => {
    const current = questions[currentQuestion];

    let matched = 0;

    current.keywords.forEach((word) => {
      if (answer.toLowerCase().includes(word)) {
        matched++;
      }
    });

    setScore((prev) => prev + matched);

    if (matched === current.keywords.length) {
      setFeedback("Excellent Answer!");
    } else if (matched > 0) {
      setFeedback("Good Answer, but can improve.");

      setWeakAreas((prev) => [
        ...prev,
        current.question,
      ]);
    } else {
      setFeedback("Weak Answer.");

      setWeakAreas((prev) => [
        ...prev,
        current.question,
      ]);
    }
  };

  // =========================
  // SUBMIT ANSWER
  // =========================

  const handleSubmit = () => {
    if (!answer.trim()) {
      alert("Please enter an answer.");
      return;
    }

    evaluateAnswer();

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion((prev) => prev + 1);
        setAnswer("");
        setFeedback("");
      }, 1500);
    } else {
      setTimeout(() => {
        setPage("result");
      }, 1500);
    }
  };

  // =========================
  // END INTERVIEW
  // =========================

  const endInterview = () => {
    const confirmEnd = window.confirm(
      "Are you sure you want to end the interview?"
    );

    if (confirmEnd) {
      setCurrentQuestion(0);
      setAnswer("");
      setScore(0);
      setFeedback("");
      setWeakAreas([]);
      setEmotion("Normal");

      setPage("company");
    }
  };

  // =========================
  // NAVIGATION
  // =========================

  const goDashboard = () => {
    setPage("dashboard");
  };

  const goCompanies = () => {
    setPage("companies");
  };

  // =========================
  // RESTART INTERVIEW
  // =========================

  const restartInterview = () => {
    setCurrentQuestion(0);
    setAnswer("");
    setScore(0);
    setFeedback("");
    setWeakAreas([]);
    setEmotion("Normal");

    setPage("interview");
  };

  // =========================
  // MAIN UI
  // =========================

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* =========================
            LOGIN PAGE
        ========================= */}

        {page === "login" && (
          <>
            <h1 style={styles.title}>
              CareerForge
            </h1>

            <p style={styles.subtitle}>
              Personalized Course-to-Placement Preparation
            </p>

            <h2>Student Login</h2>

            <input
              type="text"
              placeholder="Enter Name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              style={styles.input}
            />

            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              style={styles.input}
            />

            <input
              type="text"
              placeholder="Enter Mobile Number"
              value={mobile}
              onChange={(e) =>
                setMobile(e.target.value)
              }
              style={styles.input}
            />

            <button
              style={styles.primaryButton}
              onClick={handleLogin}
            >
              Login
            </button>
          </>
        )}

        {/* =========================
            DASHBOARD
        ========================= */}

        {page === "dashboard" && (
          <>
            <h1>
              Welcome, {name}! 👋
            </h1>

            <p style={styles.subtitle}>
              Choose your course to begin
              your career preparation.
            </p>

            <h2>Select Your Course</h2>

            <div style={styles.grid}>
              {courses.map((course) => (
                <button
                  key={course.id}
                  style={styles.courseCard}
                  onClick={() =>
                    selectCourse(course.shortName)
                  }
                >
                  <h3>
                    {course.shortName}
                  </h3>

                  <p>
                    {course.name}
                  </p>
                </button>
              ))}
            </div>
          </>
        )}

        {/* =========================
            COMPANY SELECTION
        ========================= */}

        {page === "companies" && (
          <>
            <h1>
              {selectedCourse}
            </h1>

            <p style={styles.subtitle}>
              Select your desired company.
            </p>

            <div style={styles.grid}>
              {companies[selectedCourse]?.map(
                (company) => (
                  <button
                    key={company}
                    style={styles.companyCard}
                    onClick={() =>
                      selectCompany(company)
                    }
                  >
                    🏢

                    <h3>
                      {company}
                    </h3>

                    <p>
                      View preparation pathway
                    </p>
                  </button>
                )
              )}
            </div>

            <button
              style={styles.secondaryButton}
              onClick={goDashboard}
            >
              ← Back to Courses
            </button>
          </>
        )}

        {/* =========================
            COMPANY PREPARATION
        ========================= */}

        {page === "company" && (
          <>
            <h1>
              {selectedCompany}
            </h1>

            <p style={styles.subtitle}>
              {selectedCourse} Preparation
            </p>

            <div style={styles.section}>
              <h2>Interview Rounds</h2>

              {interviewRounds.map(
                (round, index) => (
                  <div
                    key={index}
                    style={styles.roundCard}
                  >
                    <strong>
                      {round}
                    </strong>

                    <p>
                      Prepare for the{" "}
                      {round.toLowerCase()} round.
                    </p>
                  </div>
                )
              )}
            </div>

            <div style={styles.section}>
              <h2>
                Preparation Resources
              </h2>

              {resources.map(
                (resource, index) => (
                  <div
                    key={index}
                    style={styles.resourceCard}
                  >
                    <strong>
                      {resource.title}
                    </strong>

                    <p>
                      {resource.type}
                    </p>

                    <a
                      href={resource.link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open Resource →
                    </a>
                  </div>
                )
              )}
            </div>

            <button
              style={styles.primaryButton}
              onClick={startInterview}
            >
              Start Mock Interview
            </button>

            <button
              style={styles.secondaryButton}
              onClick={goCompanies}
            >
              ← Choose Another Company
            </button>
          </>
        )}

        {/* =========================
            MOCK INTERVIEW
        ========================= */}

        {page === "interview" && (
          <>
            <h1>
              Mock Interview
            </h1>

            <p style={styles.subtitle}>
              {selectedCompany} •{" "}
              {selectedCourse}
            </p>

            <h3>
              {questions[currentQuestion].type}{" "}
              Question
            </h3>

            <p style={styles.progress}>
              Question{" "}
              {currentQuestion + 1} of{" "}
              {questions.length}
            </p>

            <h2>
              {
                questions[currentQuestion]
                  .question
              }
            </h2>

            <textarea
              rows="6"
              placeholder="Type your answer here..."
              value={answer}
              onChange={(e) =>
                setAnswer(e.target.value)
              }
              style={styles.textarea}
            />

            <div style={styles.buttonContainer}>
              <button
                style={styles.voiceButton}
                onClick={startVoiceInput}
              >
                🎤 Voice Input
              </button>

              <button
                style={styles.cameraButton}
                onClick={openCamera}
              >
                📷 Open Camera
              </button>
            </div>

            <video
              ref={videoRef}
              autoPlay
              style={styles.video}
            />

            <p>
              Communication Indicator:{" "}
              <strong>
                {emotion}
              </strong>
            </p>

            {feedback && (
              <div style={styles.feedback}>
                {feedback}
              </div>
            )}

            {/* SUBMIT */}
            <button
              style={styles.primaryButton}
              onClick={handleSubmit}
            >
              Submit Answer
            </button>

            {/* END INTERVIEW */}
            <button
              style={styles.secondaryButton}
              onClick={endInterview}
            >
              End Interview
            </button>
          </>
        )}

        {/* =========================
            RESULT PAGE
        ========================= */}

        {page === "result" && (
          <>
            <h1>
              Interview Completed 🎉
            </h1>

            <h2>
              Score: {score}
            </h2>

            <h3>
              Performance:{" "}
              {score >= 8
                ? "Excellent"
                : score >= 4
                ? "Good"
                : "Needs Improvement"}
            </h3>

            <div style={styles.section}>
              <h2>
                Identified Weak Areas
              </h2>

              {weakAreas.length > 0 ? (
                <ul style={styles.list}>
                  {weakAreas.map(
                    (item, index) => (
                      <li key={index}>
                        {item}
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p>
                  No major weak areas identified.
                </p>
              )}
            </div>

            <div style={styles.section}>
              <h2>
                Next Step
              </h2>

              <p>
                CareerForge will later use
                your performance to identify
                skill gaps and create a
                personalized preparation
                pathway.
              </p>
            </div>

            <button
              style={styles.primaryButton}
              onClick={restartInterview}
            >
              Restart Interview
            </button>

            <button
              style={styles.secondaryButton}
              onClick={goDashboard}
            >
              Back to Dashboard
            </button>
          </>
        )}

      </div>
    </div>
  );
}

// =========================
// STYLES
// =========================

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#eef2f7",
    fontFamily: "Arial",
    padding: "30px",
  },

  card: {
    backgroundColor: "white",
    padding: "35px",
    width: "800px",
    maxWidth: "95%",
    borderRadius: "18px",
    textAlign: "center",
    boxShadow:
      "0 0 20px rgba(0,0,0,0.1)",
  },

  title: {
    fontSize: "42px",
    marginBottom: "10px",
  },

  subtitle: {
    color: "#666",
    marginBottom: "25px",
  },

  input: {
    width: "90%",
    padding: "13px",
    margin: "8px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "15px",
  },

  textarea: {
    width: "95%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    marginTop: "15px",
    fontSize: "15px",
  },

  primaryButton: {
    padding: "13px 25px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "9px",
    cursor: "pointer",
    margin: "10px",
    fontSize: "15px",
  },

  secondaryButton: {
    padding: "11px 22px",
    backgroundColor: "#e5e7eb",
    color: "#333",
    border: "none",
    borderRadius: "9px",
    cursor: "pointer",
    margin: "10px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    marginTop: "20px",
  },

  courseCard: {
    padding: "20px",
    backgroundColor: "#f8fafc",
    border: "1px solid #dbe3ef",
    borderRadius: "12px",
    cursor: "pointer",
  },

  companyCard: {
    padding: "20px",
    backgroundColor: "#f8fafc",
    border: "1px solid #dbe3ef",
    borderRadius: "12px",
    cursor: "pointer",
  },

  section: {
    marginTop: "25px",
    marginBottom: "25px",
    textAlign: "left",
  },

  roundCard: {
    padding: "15px",
    margin: "10px 0",
    backgroundColor: "#f8fafc",
    borderRadius: "10px",
    border: "1px solid #ddd",
  },

  resourceCard: {
    padding: "15px",
    margin: "10px 0",
    backgroundColor: "#f8fafc",
    borderRadius: "10px",
    border: "1px solid #ddd",
  },

  voiceButton: {
    padding: "10px 18px",
    backgroundColor: "#2196f3",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },

  cameraButton: {
    padding: "10px 18px",
    backgroundColor: "#ff5722",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },

  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    marginTop: "20px",
    flexWrap: "wrap",
  },

  video: {
    width: "300px",
    maxWidth: "100%",
    marginTop: "20px",
    borderRadius: "10px",
  },

  feedback: {
    padding: "12px",
    margin: "15px 0",
    backgroundColor: "#f0fdf4",
    borderRadius: "8px",
    fontWeight: "bold",
  },

  progress: {
    color: "#666",
  },

  list: {
    textAlign: "left",
  },
};

export default App;