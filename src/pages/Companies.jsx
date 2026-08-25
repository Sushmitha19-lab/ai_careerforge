import React from "react";

const companyData = {
  "Artificial Intelligence & ML": [
    ["Google", "AI / ML Engineer"],
    ["Microsoft", "AI Engineer"],
    ["Amazon", "Machine Learning"],
    ["NVIDIA", "AI / Deep Learning"],
    ["IBM", "AI & Data"],
    ["Adobe", "ML Engineer"],
    ["Infosys", "AI / ML"],
    ["TCS", "AI & Analytics"],
    ["Accenture", "AI Engineering"],
    ["Wipro", "AI / Data"],
  ],

  "Data Science": [
    ["Google", "Data Scientist"],
    ["Microsoft", "Data Analyst"],
    ["Amazon", "Data Science"],
    ["IBM", "Data Scientist"],
    ["Adobe", "Data Science"],
    ["Walmart", "Data Analyst"],
    ["Deloitte", "Analytics"],
    ["Infosys", "Data Science"],
    ["Accenture", "Analytics"],
    ["TCS", "Data & AI"],
  ],

  "Web Development": [
    ["Google", "Software Engineer"],
    ["Microsoft", "Frontend Engineer"],
    ["Amazon", "Software Development"],
    ["Adobe", "Web Engineer"],
    ["Meta", "Frontend Engineer"],
    ["Walmart", "Web Developer"],
    ["Infosys", "Full Stack"],
    ["TCS", "Web Development"],
    ["Accenture", "Full Stack"],
    ["Wipro", "Web Developer"],
  ],

  "Cyber Security": [
    ["Microsoft", "Security Engineer"],
    ["Google", "Security Engineer"],
    ["IBM", "Cyber Security"],
    ["Amazon", "Security"],
    ["Cisco", "Network Security"],
    ["Deloitte", "Cyber Risk"],
    ["Accenture", "Cyber Security"],
    ["TCS", "Security Analyst"],
    ["Wipro", "Cyber Security"],
    ["Infosys", "Security"],
  ],

  "Cloud Computing": [
    ["Amazon", "Cloud Engineer"],
    ["Microsoft", "Azure Engineer"],
    ["Google", "Cloud Engineer"],
    ["IBM", "Cloud"],
    ["Oracle", "Cloud Engineer"],
    ["Cisco", "Cloud Networking"],
    ["Accenture", "Cloud"],
    ["Deloitte", "Cloud Consulting"],
    ["Infosys", "Cloud"],
    ["TCS", "Cloud Engineering"],
  ],

  "Software Engineering": [
    ["Google", "Software Engineer"],
    ["Microsoft", "Software Engineer"],
    ["Amazon", "SDE"],
    ["Adobe", "Software Engineer"],
    ["Meta", "Software Engineer"],
    ["IBM", "Software Developer"],
    ["Infosys", "Software Engineer"],
    ["TCS", "Developer"],
    ["Accenture", "Software Engineer"],
    ["Wipro", "Developer"],
  ],

  "Computer Networks": [
    ["Cisco", "Network Engineer"],
    ["Juniper", "Network Engineer"],
    ["Microsoft", "Network Engineer"],
    ["Amazon", "Network Engineer"],
    ["Google", "Network Engineer"],
    ["IBM", "Network Specialist"],
    ["TCS", "Network Engineer"],
    ["Infosys", "Network Engineer"],
    ["Wipro", "Network Engineer"],
    ["Accenture", "Network Engineer"],
  ],

  "Database Systems": [
    ["Oracle", "Database Engineer"],
    ["Microsoft", "Database Engineer"],
    ["Amazon", "Database"],
    ["Google", "Database"],
    ["IBM", "Database"],
    ["Adobe", "Database"],
    ["TCS", "Database"],
    ["Infosys", "Database"],
    ["Accenture", "Data Engineering"],
    ["Wipro", "Database"],
  ],
};

function Companies({
  course,
  onBack,
  onSelectCompany,
}) {
  const companies =
    companyData[course?.name] ||
    companyData["Artificial Intelligence & ML"];

  return (
    <div className="inner-page">

      <header className="inner-header">

        <button
          className="back-button"
          onClick={onBack}
        >
          ← Courses
        </button>

        <div className="mini-brand">
          <div className="brand-mark">C</div>
          <strong>CareerForge</strong>
        </div>

      </header>


      <main className="inner-content">

        <p className="eyebrow">
          STEP 02 · COMPANY DISCOVERY
        </p>

        <h1 className="page-title">
          Companies for {course?.name}
        </h1>

        <p className="page-subtitle">
          Choose a company to explore its interview
          process, preparation resources and practice path.
        </p>


        <div className="company-count">
          {companies.length} companies available
        </div>


        <div className="company-grid">

          {companies.map((item, index) => {

            const [name, role] = item;

            return (
              <button
                className="company-card"
                key={name}
                onClick={() =>
                  onSelectCompany({
                    name,
                    role,
                  })
                }
              >

                <div className="company-top">

                  <div className="company-logo">
                    {name.charAt(0)}
                  </div>

                  <span>
                    0{index + 1}
                  </span>

                </div>

                <h2>{name}</h2>

                <p>{role}</p>

                <strong>
                  Prepare for this company →
                </strong>

              </button>
            );
          })}

        </div>

      </main>

    </div>
  );
}

export default Companies;