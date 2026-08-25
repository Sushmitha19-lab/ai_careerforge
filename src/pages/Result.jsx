import React from "react";

function Result({
  student,
  course,
  company,
  result,
  onDashboard,
  onRetry,
}) {
  const overall = result?.overall || 0;

  return (
    <div className="result-page">

      <header className="inner-header">

        <div className="mini-brand">
          <div className="brand-mark">C</div>
          <strong>CareerForge</strong>
        </div>

        <span className="result-company">
          {company?.name}
        </span>

      </header>


      <main className="result-container">

        <div className="result-intro">

          <p className="eyebrow">
            INTERVIEW COMPLETE
          </p>

          <h1>
            Here's how you performed,
            <br />
            {student?.name || "Student"}.
          </h1>

          <p>
            Your mock interview for{" "}
            <strong>{company?.name}</strong>{" "}
            has been evaluated.
          </p>

        </div>


        <section className="score-overview">

          <div className="overall-score">

            <span>
              OVERALL READINESS
            </span>

            <strong>
              {overall}%
            </strong>

            <small>
              {overall >= 75
                ? "Good preparation"
                : "More preparation recommended"}
            </small>

          </div>


          <div className="score-list">

            <ScoreRow
              title="Technical"
              value={result?.technical || 0}
            />

            <ScoreRow
              title="Communication"
              value={result?.communication || 0}
            />

            <ScoreRow
              title="Problem Solving"
              value={result?.problemSolving || 0}
            />

          </div>

        </section>


        <section className="result-grid">

          <div className="result-card">

            <p className="section-label">
              AREAS TO IMPROVE
            </p>

            <h2>
              Focus on these next
            </h2>

            <div className="weak-area">
              <span>DSA & Problem Solving</span>
              <div>
                <i style={{ width: "62%" }} />
              </div>
            </div>

            <div className="weak-area">
              <span>Technical Explanation</span>
              <div>
                <i style={{ width: "72%" }} />
              </div>
            </div>

            <div className="weak-area">
              <span>Communication</span>
              <div>
                <i style={{ width: "81%" }} />
              </div>
            </div>

          </div>


          <div className="result-card recommendation">

            <p className="section-label">
              NEXT STEP
            </p>

            <h2>
              Strengthen your preparation
            </h2>

            <p>
              Based on your interview performance,
              focus on the areas where your answers
              were less detailed.
            </p>

            <button>
              View Learning Resources →
            </button>

          </div>

        </section>


        <div className="result-actions">

          <button
            className="secondary-action"
            onClick={onDashboard}
          >
            ← Back to Dashboard
          </button>

          <button
            className="primary-action"
            onClick={onRetry}
          >
            Try Interview Again →
          </button>

        </div>


        <footer>
          <span>CareerForge</span>
          <span>
            {course?.name} · {company?.name}
          </span>
        </footer>

      </main>

    </div>
  );
}


function ScoreRow({ title, value }) {
  return (
    <div className="score-row">

      <div className="score-row-top">

        <span>{title}</span>

        <strong>{value}%</strong>

      </div>

      <div className="score-bar">
        <i style={{ width: `${value}%` }} />
      </div>

    </div>
  );
}

export default Result;