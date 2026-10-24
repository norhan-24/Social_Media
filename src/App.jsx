
import { useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";

import {
  FiHome,
  FiUser,
  FiLogOut,
  FiLogIn,
  FiUserPlus,
  FiPlusCircle,
} from "react-icons/fi";

import Signup from "./Pages/Signup";
import Login from "./Pages/Login";
import Home from "./Pages/Home";
import CreatePost from "./Pages/CreatePost";
import PostDetails from "./Pages/PostDetails";
import Profile from "./Pages/Profile";
import ChangePassword from "./Pages/ChangePassword";

import "./App.css";

function TemporaryPage({ title }) {
  return (
    <div className="temporary-page">
      <h1>{title}</h1>
      <p>We'll build this page in the next steps.</p>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(
    localStorage.getItem("social_token")
  );

  function handleLogin(newToken) {
    localStorage.setItem("social_token", newToken);
    setToken(newToken);
  }

  function handleLogout() {
    localStorage.removeItem("social_token");
    setToken(null);
  }

  function handlePasswordChanged(newToken) {
    localStorage.setItem("social_token", newToken);
    setToken(newToken);
  }

  return (
    <BrowserRouter>
      <header className="app-header">

        <Link to="/" className="app-logo">
          Social Media
        </Link>

        <nav className="app-nav">

          {token ? (
            <>
              <Link to="/">
                <FiHome size={18} />
                Home
              </Link>

              <Link to="/profile">
                <FiUser size={18} />
                Profile
              </Link>

              <Link
                to="/create-post"
                className="app-create-button"
              >
                <FiPlusCircle size={19} />
                New Post
              </Link>

              <button
                type="button"
                className="app-logout"
                onClick={handleLogout}
              >
                <FiLogOut size={18} />
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <FiLogIn size={18} />
                Login
              </Link>

              <Link to="/signup">
                <FiUserPlus size={18} />
                Sign Up
              </Link>
            </>
          )}

        </nav>
      </header>

      <Routes>

        <Route
          path="/login"
          element={
            token ? (
              <Navigate to="/" replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />

        <Route
          path="/signup"
          element={
            token ? (
              <Navigate to="/" replace />
            ) : (
              <Signup />
            )
          }
        />

        <Route
          path="/"
          element={
            token ? (
              <Home />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/create-post"
          element={
            token ? (
              <CreatePost />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/post/:postId"
          element={
            token ? (
              <PostDetails />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/profile"
          element={
            token ? (
              <Profile />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/change-password"
          element={
            token ? (
              <ChangePassword
                onPasswordChanged={handlePasswordChanged}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="*"
          element={
            <TemporaryPage title="404 - Page Not Found" />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
