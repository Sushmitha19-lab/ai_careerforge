import React, { useState } from "react";

function Login({ onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const submit = (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      return;
    }

    onLogin({
      name: name.trim(),
      email: email.trim(),
    });
  };

  return (
    <div className="login-page">

      <div className="login-left">

        <div className="login-brand">
          <div className="brand-mark">C</div>

          <div>
            <strong>CareerForge</strong>
            <span>career preparation</span>
          </div>
        </div>

        <div className="login-content">

          <p className="eyebrow">
            YOUR CAREER, FORGED WITH PURPOSE
          </p>

          <h1>
            From learning
            <br />
            to <em>landing.</em>
          </h1>

          <p>
            Explore career paths, discover companies,
            prepare for interviews and understand the
            skills you need to strengthen.
          </p>

          <div className="login-points">
            <span>01</span>
            <span>Choose your career path</span>

            <span>02</span>
            <span>Prepare for your target company</span>

            <span>03</span>
            <span>Measure your interview readiness</span>
          </div>

        </div>

        <div className="login-footer">
          CareerForge · Student Career Preparation Platform
        </div>

      </div>


      <div className="login-right">

        <div className="login-form-card">

          <p className="form-label">
            GET STARTED
          </p>

          <h2>
            Welcome to CareerForge
          </h2>

          <p className="form-description">
            Enter your details to begin your
            personalized preparation journey.
          </p>

          <form onSubmit={submit}>

            <label>Your name</label>

            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <label>Email address</label>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              type="submit"
              className="login-button"
            >
              Begin my journey →
            </button>

          </form>

          <p className="login-note">
            Your information is used to personalize
            your CareerForge experience.
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;