import React from "react";

const courses = [
  {
    name: "Artificial Intelligence & ML",
    code: "AI / ML",
    icon: "✦",
    description:
      "Artificial intelligence, machine learning and intelligent systems.",
  },
  {
    name: "Data Science",
    code: "DATA",
    icon: "◈",
    description:
      "Statistics, analytics, visualization and data-driven solutions.",
  },
  {
    name: "Web Development",
    code: "WEB",
    icon: "⌘",
    description:
      "Modern frontend, backend and full-stack application development.",
  },
  {
    name: "Cyber Security",
    code: "CYBER",
    icon: "◇",
    description:
      "Networks, ethical hacking, security and cyber defence.",
  },
  {
    name: "Cloud Computing",
    code: "CLOUD",
    icon: "☁",
    description:
      "Cloud platforms, infrastructure, deployment and distributed systems.",
  },
  {
    name: "Software Engineering",
    code: "SWE",
    icon: "▣",
    description:
      "Programming, software design and engineering practices.",
  },
  {
    name: "Computer Networks",
    code: "NETWORK",
    icon: "⌁",
    description:
      "Networking protocols, systems, architecture and troubleshooting.",
  },
  {
    name: "Database Systems",
    code: "DATABASE",
    icon: "▤",
    description:
      "SQL, database design, management and data technologies.",
  },
];

function CourseSelection({
  student,
  onBack,
  onSelectCourse,
}) {
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


        <div className="course-grid">

          {courses.map((course, index) => (

            <button
              className="course-card"
              key={course.name}
              onClick={() => onSelectCourse(course)}
            >

              <span className="course-number">
                0{index + 1}
              </span>

              <div className="course-icon">
                {course.icon}
              </div>

              <span className="course-code">
                {course.code}
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

      </main>

    </div>
  );
}

export default CourseSelection;