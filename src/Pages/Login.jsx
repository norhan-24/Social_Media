
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { FiStar } from "react-icons/fi";

import "./Login.css";

function Login({ onLogin }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    if (!formData.login.trim() || !formData.password) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/users/signin", {
        login: formData.login.trim(),
        password: formData.password,
      });

      if (response.data.success === false) {
        throw new Error(
          response.data.message || "Login failed."
        );
      }

      const token = response.data?.data?.token;

      if (!token) {
        throw new Error(
          "No token was returned from the API."
        );
      }

      onLogin(token);

      navigate("/", { replace: true });
    } catch (error) {
      const serverData = error.response?.data;

      let message =
        serverData?.message ||
        error.message ||
        "Login failed. Please try again.";

      if (
        Array.isArray(serverData?.errors) &&
        serverData.errors.length > 0
      ) {
        message = serverData.errors.join(" - ");
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
    <main className="login-page">
      <div className="login-layout">

        <section className="login-welcome">
          <div className="login-welcome-content">

            <div className="login-brand">
              <span className="login-brand-icon"><FiStar size={24} /></span>
              <span>Social Media</span>
            </div>

            <div className="login-welcome-text">
              <span className="login-small-label">
                WELCOME BACK TO YOUR COMMUNITY
              </span>

              <h1>
                Your people.
                <br />
                Your stories.
                <br />
                <span>Your space.</span>
              </h1>

              <p>
                Pick up where you left off.
                Discover new stories and stay
                connected with your community.
              </p>
            </div>

            <div className="login-welcome-bottom">
              <span className="login-live-dot"></span>
              Good to have you back
            </div>

          </div>

          <div className="login-decoration login-decoration-one"></div>
          <div className="login-decoration login-decoration-two"></div>
        </section>

        <section className="login-form-side">
          <div className="login-form-wrapper">

            <div className="login-heading">
              <span className="login-top-text">
                WELCOME BACK
              </span>

              <h2>Log in to your account</h2>

              <p>
                Enter your credentials to continue.
              </p>
            </div>

            <form
              className="login-form"
              onSubmit={handleSubmit}
            >

              <div className="login-field">
                <label htmlFor="login-email">
                  Email or Username
                </label>

                <input
                  id="login-email"
                  type="text"
                  name="login"
                  placeholder="Enter your email or username"
                  autoComplete="username"
                  value={formData.login}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="login-field">
                <label htmlFor="login-password">
                  Password
                </label>

                <div className="login-password-wrapper">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />

                  <button
                    type="button"
                    className="login-show-password"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div
                  className="login-error"
                  role="alert"
                >
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                className="login-submit"
                disabled={loading}
              >
                {loading
                  ? "Logging in..."
                  : "Log In →"}
              </button>

            </form>

            <div className="login-divider">
              <span>New to our community?</span>
            </div>

            <Link
              to="/signup"
              className="login-signup-button"
            >
              Create a new account
            </Link>

            <p className="login-bottom-text">
              Connect. Share. Inspire.
            </p>

          </div>
        </section>

      </div>
    </main>
  );
}

export default Login;
