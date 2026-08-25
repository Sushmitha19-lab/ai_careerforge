import React from "react";

const resources = [
  {
    title: "Interview Notes",
    type: "PDF NOTES",
    icon: "▤",
  },
  {
    title: "NPTEL Courses",
    type: "VIDEO COURSE",
    icon: "▶",
  },
  {
    title: "YouTube Practice",
    type: "VIDEO",
    icon: "▷",
  },
  {
    title: "Coding Practice",
    type: "PRACTICE",
    icon: "</>",
  },
];

function CompanyPreparation({
  course,
  company,
  onBack,
  onStartInterview,
}) {
  return (
    <div className="inner-page">

      <header className="inner-header">

        <button
          className="back-button"
          onClick={onBack}
        >
          ← Companies
        </button>

        <div className="mini-brand">
          <div className="brand-mark">C</div>
          <strong>CareerForge</strong>
        </div>

      </header>


      <main className="inner-content">

        <p className="eyebrow">
          STEP 03 · COMPANY PREPARATION
        </p>

        <div className="company-heading">

          <div>

            <span className="company-role">
              {course?.name}
            </span>

            <h1 className="page-title">
              {company?.name}
            </h1>

            <p className="page-subtitle">
              Preparation path for {company?.role}.
            </p>

          </div>

          <div className="target-badge">
            TARGET COMPANY
          </div>

        </div>


        <section className="preparation-card">

          <div className="prep-heading">

            <div>
              <p className="section-label">
                INTERVIEW PROCESS
              </p>

              <h2>
                Know what you're preparing for
              </h2>
            </div>

          </div>


          <div className="rounds">

            <div className="round">
              <span>01</span>
              <strong>Aptitude</strong>
              <small>Logical & quantitative ability</small>
            </div>

            <div className="round-line" />

            <div className="round">
              <span>02</span>
              <strong>Coding</strong>
              <small>Programming & problem solving</small>
            </div>

            <div className="round-line" />

            <div className="round">
              <span>03</span>
              <strong>Technical</strong>
              <small>Core technical concepts</small>
            </div>

            <div className="round-line" />

            <div className="round">
              <span>04</span>
              <strong>HR</strong>
              <small>Communication & behavioural</small>
            </div>

          </div>

        </section>


        <div className="section-title">

          <p className="section-label">
            LEARNING MATERIAL
          </p>

          <h2>
            Prepare before you practice
          </h2>

        </div>


        <section className="resource-grid">

          {resources.map((resource) => (

            <article
              className="resource-card"
              key={resource.title}
            >

              <div className="resource-icon">
                {resource.icon}
              </div>

              <span>
                {resource.type}
              </span>

              <h3>
                {resource.title}
              </h3>

              <p>
                Curated preparation material for
                strengthening this area.
              </p>

              <button>
                Open resource →
              </button>

            </article>

          ))}

        </section>


        <section className="interview-start">

          <div>

            <p className="section-label">
              READY TO TEST YOURSELF?
            </p>

            <h2>
              Simulate the interview.
            </h2>

            <p>
              Take a mock interview based on the
              preparation path you've selected.
            </p>

          </div>

          <button
            className="primary-action"
            onClick={onStartInterview}
          >
            Start Mock Interview →
          </button>

        </section>

      </main>

    </div>
  );
}

export default CompanyPreparation;