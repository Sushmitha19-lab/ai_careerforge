import React from "react";

const companies = [
  {
    name: "Google",
    role: "Software / AI / Data",
    requirements: [
      "Strong DSA",
      "Problem solving",
      "Core CS fundamentals",
      "System design",
      "Communication",
    ],
  },
  {
    name: "Microsoft",
    role: "Software / AI",
    requirements: [
      "DSA",
      "Programming",
      "OOP concepts",
      "Computer Networks",
      "Problem solving",
    ],
  },
  {
    name: "Amazon",
    role: "Software / Cloud / Data",
    requirements: [
      "DSA",
      "Coding",
      "Problem solving",
      "CS fundamentals",
      "Behavioural skills",
    ],
  },
  {
    name: "Adobe",
    role: "Software / AI / Data",
    requirements: [
      "DSA",
      "Programming",
      "Database concepts",
      "Machine learning",
      "Communication",
    ],
  },
  {
    name: "NVIDIA",
    role: "AI / ML / Software",
    requirements: [
      "C / C++ / Python",
      "Machine learning",
      "Deep learning",
      "Algorithms",
      "Problem solving",
    ],
  },
  {
    name: "IBM",
    role: "AI / Cloud / Software",
    requirements: [
      "Programming",
      "Cloud concepts",
      "AI / ML",
      "Database",
      "Communication",
    ],
  },
  {
    name: "Accenture",
    role: "Software / Data / AI",
    requirements: [
      "Aptitude",
      "Programming",
      "Logical reasoning",
      "Communication",
      "Technical fundamentals",
    ],
  },
  {
    name: "TCS",
    role: "Software / IT",
    requirements: [
      "Aptitude",
      "Coding",
      "Programming",
      "CS fundamentals",
      "Communication",
    ],
  },
];

function ExploreCompanies({ onBack }) {
  return (
    <div className="inner-page">

      <header className="inner-header">

        <button
          className="back-button"
          onClick={onBack}
        >
          ← Dashboard
        </button>

        <div className="mini-brand">
          <div className="brand-mark">C</div>
          <strong>CareerForge</strong>
        </div>

      </header>


      <main className="inner-content">

        <p className="eyebrow">
          COMPANY DISCOVERY
        </p>

        <h1 className="page-title">
          Know where you want to go.
        </h1>

        <p className="page-subtitle">
          Explore companies commonly targeted by students
          and understand the skills they generally look for.
        </p>


        <div className="company-explore-grid">

          {companies.map((company, index) => (

            <article
              className="explore-company-card"
              key={company.name}
            >

              <div className="explore-company-top">

                <div className="explore-company-logo">
                  {company.name.charAt(0)}
                </div>

                <span>
                  0{index + 1}
                </span>

              </div>


              <h2>
                {company.name}
              </h2>

              <p className="company-role-text">
                {company.role}
              </p>


              <div className="requirement-title">
                LOOK FOR
              </div>


              <div className="requirement-list">

                {company.requirements.map(
                  (requirement) => (

                    <span key={requirement}>
                      {requirement}
                    </span>

                  )
                )}

              </div>

            </article>

          ))}

        </div>

      </main>

    </div>
  );
}

export default ExploreCompanies;