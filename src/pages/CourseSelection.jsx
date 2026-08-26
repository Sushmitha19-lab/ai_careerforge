import React, { useEffect, useState } from "react";

function CourseSelection({
  student,
  onBack,
  onSelectCourse,
}) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/courses")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load courses");
        }

        return response.json();
      })
      .then((data) => {
        setCourses(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Course loading error:", err);
        setError("Unable to load courses.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="inner-page">

      {/* HEADER */}

      <header className="inner-header">

        <button
          className="back-button"
          onClick={onBack}
        >
          ← Dashboard
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
          STEP 01 · CHOOSE YOUR PATH
        </p>


        <h1 className="page-title">
          What do you want to prepare for?
        </h1>


        <p className="page-subtitle">
          Hi {student?.name || "there"}. Select a career
          domain and we'll show you companies and
          preparation paths relevant to it.
        </p>


        {/* LOADING */}

        {loading && (
          <p style={{ marginTop: "40px", color: "#7d858a" }}>
            Loading courses...
          </p>
        )}


        {/* ERROR */}

        {error && (
          <p style={{ marginTop: "40px", color: "#e8755f" }}>
            {error}
          </p>
        )}


        {/* COURSES */}

        {!loading && !error && (

          <div className="course-grid">

            {courses.map((course, index) => (

              <button
                className="course-card"
                key={course.id}
                onClick={() => onSelectCourse(course)}
              >

                <span className="course-number">
                  {String(index + 1).padStart(2, "0")}
                </span>


                <div className="course-icon">

                  {index === 0 && "✦"}
                  {index === 1 && "◈"}
                  {index === 2 && "⌘"}
                  {index === 3 && "◇"}

                </div>


                <span className="course-code">
                  COURSE
                </span>


                <h2>
                  {course.name}
                </h2>


                <p>
                  {course.description}
                </p>


                <strong>
                  Explore companies →
                </strong>

              </button>

            ))}

          </div>

        )}

      </main>

    </div>
  );
}

export default CourseSelection;