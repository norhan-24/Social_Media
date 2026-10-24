
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FiArrowLeft,
  FiLock,
  FiShield,
  FiKey,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowRight,
} from "react-icons/fi";

import api from "../services/api";

import "./ChangePassword.css";

function ChangePassword({ onPasswordChanged, onLogout }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [visible, setVisible] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function toggleVisibility(field) {
    setVisible((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  }

  function validateForm() {
    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      return "Please fill in all fields.";
    }

    if (formData.currentPassword === formData.newPassword) {
      return "Your new password must be different from your current password.";
    }

    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!passwordPattern.test(formData.newPassword)) {
      return "New password must contain at least 8 characters, uppercase and lowercase letters, a number, and a symbol.";
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return "New password and confirmation do not match.";
    }

    return "";
  }

  function getErrorMessage(error) {
    const data = error.response?.data;

    if (Array.isArray(data?.errors) && data.errors.length) {
      return data.errors.join(" - ");
    }

    if (data?.errors && typeof data.errors === "object") {
      return Object.values(data.errors)
        .flat()
        .join(" - ");
    }

    if (error.response?.status === 401) {
      return "Your session may have expired, or the current password is incorrect. Please check your details.";
    }

    if (error.code === "ERR_NETWORK") {
      return "Could not connect to the server. Check your internet connection.";
    }

    return (
      data?.message ||
      error.message ||
      "Failed to change password."
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await api.patch(
        "/users/change-password",
        {
          password: formData.currentPassword,
          newPassword: formData.newPassword,
        }
      );

      if (response.data?.success === false) {
        throw new Error(
          response.data.message ||
          "Failed to change password."
        );
      }

      const newToken =
        response.data?.data?.token ||
        response.data?.token;

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setVisible({
        current: false,
        new: false,
        confirm: false,
      });

      if (newToken) {
        onPasswordChanged(newToken);

        setSuccessMessage(
          "Your password has been changed successfully."
        );
      } else {
        onLogout();
        navigate("/login", { replace: true });
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="password-page">
      <div className="password-container">

        <Link to="/profile" className="password-back">
          <FiArrowLeft size={18} />
          Back to Profile
        </Link>

        <div className="password-heading">
          <span>ACCOUNT SETTINGS</span>
          <h1>Change Password</h1>
          <p>
            Keep your account secure by updating your password.
          </p>
        </div>

        <div className="password-layout">

          <section className="password-info-panel">
            <div className="password-info-icon">
              <FiShield size={34} />
            </div>

            <div>
              <span className="password-info-label">
                ACCOUNT SECURITY
              </span>

              <h2>
                Your security matters.
              </h2>

              <p>
                Protect your account with a strong,
                unique password that only you know.
              </p>
            </div>

            <div className="password-tips">
              <h3>Password tips</h3>

              <div className="password-tip">
                <FiCheckCircle size={18} />
                <span>At least 8 characters</span>
              </div>

              <div className="password-tip">
                <FiCheckCircle size={18} />
                <span>Uppercase and lowercase letters</span>
              </div>

              <div className="password-tip">
                <FiCheckCircle size={18} />
                <span>Numbers and special symbols</span>
              </div>

              <div className="password-tip">
                <FiCheckCircle size={18} />
                <span>A password you haven't used before</span>
              </div>
            </div>
          </section>

          <section className="password-form-panel">

            <div className="password-form-heading">
              <div className="password-form-icon">
                <FiKey size={25} />
              </div>

              <div>
                <h2>Update your password</h2>
                <p>Enter your current and new password.</p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="password-form"
            >

              <div className="password-field">
                <label htmlFor="current-password">
                  Current Password
                </label>

                <div className="password-input-wrapper">
                  <FiLock className="password-input-icon" size={18} />

                  <input
                    id="current-password"
                    type={visible.current ? "text" : "password"}
                    name="currentPassword"
                    placeholder="Enter your current password"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-visibility"
                    onClick={() =>
                      toggleVisibility("current")
                    }
                    aria-label={
                      visible.current
                        ? "Hide current password"
                        : "Show current password"
                    }
                  >
                    {visible.current ? (
                      <FiEyeOff size={19} />
                    ) : (
                      <FiEye size={19} />
                    )}
                  </button>
                </div>
              </div>

              <div className="password-divider"></div>

              <div className="password-field">
                <label htmlFor="new-password">
                  New Password
                </label>

                <div className="password-input-wrapper">
                  <FiLock className="password-input-icon" size={18} />

                  <input
                    id="new-password"
                    type={visible.new ? "text" : "password"}
                    name="newPassword"
                    placeholder="Create a strong new password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-visibility"
                    onClick={() =>
                      toggleVisibility("new")
                    }
                    aria-label={
                      visible.new
                        ? "Hide new password"
                        : "Show new password"
                    }
                  >
                    {visible.new ? (
                      <FiEyeOff size={19} />
                    ) : (
                      <FiEye size={19} />
                    )}
                  </button>
                </div>
              </div>

              <div className="password-field">
                <label htmlFor="confirm-password">
                  Confirm New Password
                </label>

                <div className="password-input-wrapper">
                  <FiLock className="password-input-icon" size={18} />

                  <input
                    id="confirm-password"
                    type={visible.confirm ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Repeat your new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-visibility"
                    onClick={() =>
                      toggleVisibility("confirm")
                    }
                    aria-label={
                      visible.confirm
                        ? "Hide confirmation password"
                        : "Show confirmation password"
                    }
                  >
                    {visible.confirm ? (
                      <FiEyeOff size={19} />
                    ) : (
                      <FiEye size={19} />
                    )}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="password-error" role="alert">
                  <FiAlertCircle size={19} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="password-success" role="status">
                  <FiCheckCircle size={20} />
                  <span>{successMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="password-submit"
                disabled={loading}
              >
                <FiShield size={19} />

                {loading
                  ? "Updating Password..."
                  : "Update Password"}
              </button>

            </form>

            <Link
              to="/profile"
              className="password-return"
            >
              Return to Profile
              <FiArrowRight size={16} />
            </Link>

          </section>

        </div>

      </div>
    </main>
  );
}

export default ChangePassword;
