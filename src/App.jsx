// ======================================================
// AI INTERVIEW BOT - FULL REACT APP
// React + Vite
// ======================================================

// IMPORT REACT HOOKS
import { useState, useRef } from "react";

function App() {

  // ======================================================
  // QUESTIONS DATABASE
  // ======================================================

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



  // ======================================================
  // STATES
  // ======================================================

  // WHICH PAGE TO SHOW
  // login → home → interview → result
  const [page, setPage] = useState("login");


  // USER DETAILS
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");


  // INTERVIEW STATES
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [answer, setAnswer] = useState("");

  const [score, setScore] = useState(0);

  const [feedback, setFeedback] = useState("");

  const [weakAreas, setWeakAreas] = useState([]);

  const [emotion, setEmotion] = useState("Normal");


  // CAMERA REFERENCE
  const videoRef = useRef(null);



  // ======================================================
  // LOGIN FUNCTION
  // ======================================================

  const handleLogin = () => {

    // CHECK EMPTY FIELDS
    if (!name || !email || !mobile) {
      alert("Please fill all fields");
      return;
    }

    // GO TO HOME PAGE
    setPage("home");
  };



  // ======================================================
  // START INTERVIEW
  // ======================================================

  const startInterview = () => {
    setPage("interview");
  };



  // ======================================================
  // VOICE INPUT FUNCTION
  // ======================================================

  const startVoiceInput = () => {

    // CHECK BROWSER SUPPORT
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported");
      return;
    }

    // CREATE OBJECT
    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";

    // START LISTENING
    recognition.start();


    // WHEN USER SPEAKS
    recognition.onresult = (event) => {

      // GET SPOKEN TEXT
      const transcript = event.results[0][0].transcript;

      // PUT TEXT INSIDE ANSWER BOX
      setAnswer(transcript);


      // BASIC NERVOUSNESS CHECK
      if (transcript.length < 15) {
        setEmotion("Nervous / Low Confidence");
      } else {
        setEmotion("Confident");
      }
    };
  };



  // ======================================================
  // OPEN CAMERA
  // ======================================================

  const openCamera = async () => {

    try {

      // ACCESS WEBCAM
      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
        });

      // SHOW CAMERA IN VIDEO BOX
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

    } catch (error) {

      console.log(error);

      alert("Camera access denied");

    }
  };



  // ======================================================
  // ANSWER EVALUATION
  // ======================================================

  const evaluateAnswer = () => {

    // GET CURRENT QUESTION
    const current = questions[currentQuestion];

    let matched = 0;


    // CHECK KEYWORDS
    current.keywords.forEach((word) => {

      if (
        answer.toLowerCase().includes(word)
      ) {
        matched++;
      }
    });


    // UPDATE SCORE
    setScore((prev) => prev + matched);


    // FEEDBACK LOGIC
    if (matched === current.keywords.length) {

      setFeedback("Excellent Answer!");

    } else if (matched > 0) {

      setFeedback("Good Answer, but can improve.");

      // ADD TO WEAK AREA
      setWeakAreas((prev) => [
        ...prev,
        current.question,
      ]);

    } else {

      setFeedback("Weak Answer.");

      // ADD TO WEAK AREA
      setWeakAreas((prev) => [
        ...prev,
        current.question,
      ]);
    }
  };



  // ======================================================
  // SUBMIT BUTTON
  // ======================================================

  const handleSubmit = () => {

    // CHECK EMPTY ANSWER
    if (!answer) {
      alert("Please enter answer");
      return;
    }

    // EVALUATE ANSWER
    evaluateAnswer();


    // NEXT QUESTION
    if (
      currentQuestion <
      questions.length - 1
    ) {

      setTimeout(() => {

        setCurrentQuestion((prev) => prev + 1);

        setAnswer("");

        setFeedback("");

      }, 1500);

    } else {

      // INTERVIEW FINISHED
      setPage("result");
    }
  };



  // ======================================================
  // RESTART INTERVIEW
  // ======================================================

  const restartInterview = () => {

    setCurrentQuestion(0);

    setAnswer("");

    setScore(0);

    setFeedback("");

    setWeakAreas([]);

    setEmotion("Normal");

    setPage("interview");
  };



  // ======================================================
  // GO BACK TO HOME PAGE
  // ======================================================

  const goHome = () => {

    setCurrentQuestion(0);

    setAnswer("");

    setScore(0);

    setFeedback("");

    setWeakAreas([]);

    setEmotion("Normal");

    setPage("home");
  };



  // ======================================================
  // MAIN UI
  // ======================================================

  return (

    <div style={styles.container}>

      <div style={styles.card}>


        {/* ======================================================
            LOGIN PAGE
        ====================================================== */}

        {page === "login" && (

          <>

            <h1>AI Interview Bot</h1>

            <h2>Login</h2>


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
              style={styles.loginBtn}
              onClick={handleLogin}
            >
              Login
            </button>

          </>
        )}



        {/* ======================================================
            HOME PAGE
        ====================================================== */}

        {page === "home" && (

          <>

            <h1>Welcome {name}</h1>

            <h2>
              AI Mock Interview System
            </h2>

            <button
              style={styles.startBtn}
              onClick={startInterview}
            >
              Start Interview
            </button>

          </>
        )}



        {/* ======================================================
            INTERVIEW PAGE
        ====================================================== */}

        {page === "interview" && (

          <>

            <h1>AI Interview Bot</h1>


            <h3>
              {questions[currentQuestion].type}
              {" "}Question
            </h3>


            <h2>
              {
                questions[currentQuestion]
                  .question
              }
            </h2>


            {/* ANSWER BOX */}

            <textarea
              rows="5"
              placeholder="Enter your answer"
              value={answer}
              onChange={(e) =>
                setAnswer(e.target.value)
              }
              style={styles.textarea}
            />


            {/* BUTTONS */}

            <div style={styles.buttonContainer}>


              <button
                style={styles.voiceBtn}
                onClick={startVoiceInput}
              >
                🎤 Voice Input
              </button>


              <button
                style={styles.cameraBtn}
                onClick={openCamera}
              >
                📷 Open Camera
              </button>

            </div>



            {/* CAMERA SCREEN */}

            <video
              ref={videoRef}
              autoPlay
              style={styles.video}
            ></video>



            {/* EMOTION */}

            <h3>
              Emotion Detection:
              {" "}
              {emotion}
            </h3>



            {/* SUBMIT */}

            <button
              style={styles.submitBtn}
              onClick={handleSubmit}
            >
              Submit
            </button>



            {/* FEEDBACK */}

            <h3>{feedback}</h3>

          </>
        )}



        {/* ======================================================
            RESULT PAGE
        ====================================================== */}

        {page === "result" && (

          <>

            <h1>Interview Completed</h1>


            <h2>
              Final Score: {score}
            </h2>


            {/* PERFORMANCE */}

            <h3>

              Performance:

              {" "}

              {
                score >= 8
                  ? "Excellent"
                  : score >= 4
                  ? "Good"
                  : "Needs Improvement"
              }

            </h3>



            {/* WEAK AREAS */}

            <h3>Weak Areas:</h3>


            {
              weakAreas.length > 0 ? (

                <ul>

                  {
                    weakAreas.map(
                      (item, index) => (

                        <li key={index}>
                          {item}
                        </li>
                      )
                    )
                  }

                </ul>

              ) : (

                <p>No Weak Areas</p>

              )
            }



            {/* BUTTONS */}

            <div style={styles.buttonContainer}>


              <button
                style={styles.restartBtn}
                onClick={restartInterview}
              >
                Restart Interview
              </button>


              <button
                style={styles.cancelBtn}
                onClick={goHome}
              >
                Back To Home
              </button>

            </div>

          </>
        )}

      </div>

    </div>
  );
}



// ======================================================
// STYLES
// ======================================================

const styles = {

  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#eef2f7",
    fontFamily: "Arial",
  },

  card: {
    backgroundColor: "white",
    padding: "30px",
    width: "700px",
    borderRadius: "15px",
    textAlign: "center",
    boxShadow: "0 0 20px rgba(0,0,0,0.1)",
  },

  input: {
    width: "90%",
    padding: "12px",
    margin: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },

  textarea: {
    width: "100%",
    padding: "10px",
    borderRadius: "10px",
    marginTop: "20px",
  },

  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginTop: "20px",
    flexWrap: "wrap",
  },

  loginBtn: {
    padding: "12px 25px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "10px",
  },

  startBtn: {
    padding: "14px 30px",
    backgroundColor: "#2196F3",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    marginTop: "20px",
    fontSize: "16px",
  },

  voiceBtn: {
    padding: "10px 20px",
    backgroundColor: "#2196F3",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },

  cameraBtn: {
    padding: "10px 20px",
    backgroundColor: "#FF5722",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },

  submitBtn: {
    marginTop: "20px",
    padding: "12px 25px",
    backgroundColor: "green",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },

  restartBtn: {
    padding: "12px 20px",
    backgroundColor: "#9C27B0",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },

  cancelBtn: {
    padding: "12px 20px",
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },

  video: {
    width: "300px",
    marginTop: "20px",
    borderRadius: "10px",
  },
};

export default App;