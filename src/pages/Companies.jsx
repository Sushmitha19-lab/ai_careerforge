import React, { useEffect, useState } from "react";

function Companies({
  course,
  onBack,
  onSelectCompany,
}) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!course?.id) {
      setError("No course selected.");
      setLoading(false);
      return;
    }

    fetch(`http://localhost:5000/api/courses/${course.id}/companies`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load companies");
        }

        return response.json();
      })
      .then((data) => {
        setCompanies(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Company loading error:", err);
        setError("Unable to load companies.");
        setLoading(false);
      });
  }, [course]);

  return (
    <div className="inner-page">

      {/* HEADER */}

      <header className="inner-header">

        <button
          className="back-button"
          onClick={onBack}
        >
          ← Courses
        </button>

        <div className="mini-brand">

          <div className="brand-mark">
            C
          </div>

          <strong>
            CareerForge
          </strong>

        </div>

      </header>


      {/* CONTENT */}

      <main className="inner-content">

        <p className="eyebrow">
          STEP 02 · COMPANY DISCOVERY
        </p>


        <h1 className="page-title">
          Companies for {course?.name || "your course"}
        </h1>


        <p className="page-subtitle">
          Choose a company to explore its interview
          process, preparation resources and practice path.
        </p>


        {/* LOADING */}

        {loading && (
          <p
            style={{
              marginTop: "40px",
              color: "#7d858a",
            }}
          >
            Loading companies...
          </p>
        )}


        {/* ERROR */}

        {error && (
          <p
            style={{
              marginTop: "40px",
              color: "#e8755f",
            }}
          >
            {error}
          </p>
        )}


        {/* COMPANY COUNT */}

        {!loading && !error && (
          <div className="company-count">
            {companies.length} companies available
          </div>
        )}


        {/* COMPANY CARDS */}

        {!loading && !error && (

          <div className="company-grid">

            {companies.map((company, index) => (

              <button
                className="company-card"
                key={company.id}
                onClick={() =>
                  onSelectCompany({
                    ...company,
                    courseId: course.id,
                    courseName: course.name,
                  })
                }
              >

                <div className="company-top">

                  <div className="company-logo">
                    {company.name?.charAt(0)}
                  </div>

                  <span>
                    {String(index + 1).padStart(2, "0")}
                  </span>

                </div>


                <h2>
                  {company.name}
                </h2>


                <p>
                  {company.industry ||
                    company.description ||
                    "Career opportunity"}
                </p>


                <strong>
                  Prepare for this company →
                </strong>

              </button>

            ))}

          </div>

        )}

      </main>

    </div>
  );
}

export default Companies;