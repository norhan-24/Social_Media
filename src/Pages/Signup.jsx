
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./Signup.css";
import { FiStar } from "react-icons/fi";

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    rePassword: "",
    dateOfBirth: "",
    gender: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  function handleValidation() {
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      return "Please enter your full name.";
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.username)) {
      return "Username must be 3–20 English letters, numbers or underscores.";
    }

    if (!formData.email.trim()) {
      return "Please enter your email.";
    }

    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!passwordPattern.test(formData.password)) {
      return "Password must have 8+ characters, uppercase, lowercase, a number and a symbol.";
    }

    if (formData.password !== formData.rePassword) {
      return "Passwords do not match.";
    }

    if (!formData.dateOfBirth) {
      return "Please select your date of birth.";
    }

    if (new Date(formData.dateOfBirth) >= new Date()) {
      return "Please enter a valid date of birth.";
    }

    if (!formData.gender) {
      return "Please select your gender.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const validationError = handleValidation();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/users/signup", {
        name: formData.name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        rePassword: formData.rePassword,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
      });

      if (response.data.success === false) {
        throw new Error(response.data.message || "Registration failed.");
      }

      setSuccessMessage(
        "Account created successfully! You can now log in."
      );

      setFormData({
        name: "",
        username: "",
        email: "",
        password: "",
        rePassword: "",
        dateOfBirth: "",
        gender: "",
      });
    } catch (error) {
      const serverData = error.response?.data;
      const serverErrors = serverData?.errors;

      let message =
        serverData?.message ||
        error.message ||
        "Something went wrong. Please try again.";

      if (Array.isArray(serverErrors) && serverErrors.length > 0) {
        message = serverErrors.join(" - ");
      } else if (serverErrors && typeof serverErrors === "object") {
        message = Object.values(serverErrors)
          .flat()
          .join(" - ");
      }

      if (error.response?.status === 404) {
        message =
          "The signup endpoint was not found. Please check the API URL.";
      }

      if (error.code === "ERR_NETWORK") {
        message =
          "Could not connect to the API. Check your internet connection.";
      }

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="signup-page">
      <div className="signup-layout">

        <section className="signup-welcome">
          <div className="signup-welcome-content">
            <div className="signup-brand">
              <span className="signup-brand-icon"><FiStar size={24} /></span>
              <span>Social Media</span>
            </div>

            <div className="signup-welcome-text">
              <span className="signup-small-label">
                YOUR COMMUNITY STARTS HERE
              </span>

              <h1>
                Connect.
                <br />
                Share.
                <br />
                <span>Inspire.</span>
              </h1>

              <p>
                A place to share your stories, connect with
                people and discover new perspectives.
              </p>
            </div>

            <div className="signup-welcome-bottom">
              <span className="signup-live-dot"></span>
              Your next connection is one click away
            </div>
          </div>

          <div className="signup-decoration signup-decoration-one"></div>
          <div className="signup-decoration signup-decoration-two"></div>
        </section>

        <section className="signup-form-side">
          <div className="signup-form-wrapper">

            <div className="signup-heading">
              <span className="signup-top-text">
                JOIN OUR COMMUNITY
              </span>

              <h2>Create an account</h2>

              <p>
                Enter your details and get started today.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="signup-form">

              <div className="signup-field">
                <label htmlFor="signup-name">Full Name</label>
                <input
                  id="signup-name"
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="signup-field">
                <label htmlFor="signup-username">Username</label>
                <input
                  id="signup-username"
                  type="text"
                  name="username"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="signup-field">
                <label htmlFor="signup-email">Email Address</label>
                <input
                  id="signup-email"
                  type="email"
                  name="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="signup-field">
                <label htmlFor="signup-password">Password</label>

                <div className="signup-password-wrapper">
                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="signup-show-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="signup-field">
                <label htmlFor="signup-repassword">
                  Confirm Password
                </label>

                <input
                  id="signup-repassword"
                  type="password"
                  name="rePassword"
                  placeholder="Repeat your password"
                  value={formData.rePassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="signup-form-row">

                <div className="signup-field">
                  <label htmlFor="signup-birth">
                    Date of Birth
                  </label>

                  <input
                    id="signup-birth"
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="signup-field">
                  <label htmlFor="signup-gender">Gender</label>

                  <select
                    id="signup-gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

              </div>

              {errorMessage && (
                <div className="signup-error" role="alert">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="signup-success" role="status">
                  {successMessage}
                  <Link to="/login"> Go to Login →</Link>
                </div>
              )}

              <button
                type="submit"
                className="signup-submit"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Account →"}
              </button>

            </form>

            <p className="signup-login-text">
              Already have an account?{" "}
              <Link to="/login">Log In</Link>
            </p>

          </div>
        </section>

      </div>
    </main>
  );
}

export default Signup;
