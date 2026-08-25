import { useState } from "react";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CourseSelection from "./pages/CourseSelection";
import Companies from "./pages/Companies";
import CompanyPreparation from "./pages/CompanyPreparation";
import MockInterview from "./pages/MockInterview";
import Result from "./pages/Result";
import ExploreCompanies from "./pages/explorecompany";
import PreparationGuide from "./pages/PreparationGuide";

import "./App.css";

function App() {

  const [page, setPage] = useState("login");

  const [student, setStudent] = useState({
    name: "",
    email: "",
  });

  const [course, setCourse] = useState(null);
  const [company, setCompany] = useState(null);
  const [result, setResult] = useState(null);


  const login = (data) => {
    setStudent(data);
    setPage("dashboard");
  };


  const selectCourse = (selectedCourse) => {
    setCourse(selectedCourse);
    setPage("companies");
  };


  const selectCompany = (selectedCompany) => {
    setCompany(selectedCompany);
    setPage("preparation");
  };


  const finishInterview = (interviewResult) => {
    setResult(interviewResult);
    setPage("result");
  };


  return (
    <>

      {page === "login" && (
        <Login
          onLogin={login}
        />
      )}


      {page === "dashboard" && (
        <Dashboard
          student={student}

          onSelectCourse={() =>
            setPage("courses")
          }

          onExploreCompanies={() =>
            setPage("explore-companies")
          }

          onPrepare={() =>
            setPage("preparation-guide")
          }

          onLogout={() => {
            setStudent({
              name: "",
              email: "",
            });

            setPage("login");
          }}
        />
      )}


      {page === "courses" && (
        <CourseSelection
          student={student}

          onBack={() =>
            setPage("dashboard")
          }

          onSelectCourse={selectCourse}
        />
      )}


      {page === "companies" && (
        <Companies
          student={student}
          course={course}

          onBack={() =>
            setPage("courses")
          }

          onSelectCompany={selectCompany}
        />
      )}


      {page === "preparation" && (
        <CompanyPreparation
          student={student}
          course={course}
          company={company}

          onBack={() =>
            setPage("companies")
          }

          onStartInterview={() =>
            setPage("interview")
          }
        />
      )}


      {page === "interview" && (
        <MockInterview
          student={student}
          course={course}
          company={company}

          onBack={() =>
            setPage("preparation")
          }

          onFinish={finishInterview}
        />
      )}


      {page === "result" && (
        <Result
          student={student}
          course={course}
          company={company}
          result={result}

          onDashboard={() =>
            setPage("dashboard")
          }

          onRetry={() =>
            setPage("interview")
          }
        />
      )}


      {page === "explore-companies" && (
        <ExploreCompanies
          onBack={() =>
            setPage("dashboard")
          }
        />
      )}


      {page === "preparation-guide" && (
        <PreparationGuide
          onBack={() =>
            setPage("dashboard")
          }
        />
      )}

    </>
  );
}

export default App;