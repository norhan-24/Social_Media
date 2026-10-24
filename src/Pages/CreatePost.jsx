
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FiArrowLeft,
  FiImage,
  FiX,
  FiSend,
  FiEdit3,
  FiGlobe,
} from "react-icons/fi";

import api from "../services/api";

import "./CreatePost.css";

function CreatePost() {
  const navigate = useNavigate();

  const [body, setBody] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function handleImageChange(event) {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Please choose an image smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    setErrorMessage("");
    setImage(file);

    const reader = new FileReader();

    reader.onload = function () {
      setPreview(reader.result);
    };

    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImage(null);
    setPreview("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    if (!body.trim()) {
      setErrorMessage("Please write something before posting.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("body", body.trim());

      if (image) {
        formData.append("image", image);
      }

      const response = await api.post("/posts", formData);

      if (response.data.success === false) {
        throw new Error(
          response.data.message || "Failed to create post."
        );
      }

      navigate("/", { replace: true });

    } catch (error) {
      const data = error.response?.data;

      let message =
        data?.message ||
        error.message ||
        "Failed to create post.";

      if (Array.isArray(data?.errors)) {
        message = data.errors.join(" - ");
      }

      if (error.response?.status === 401) {
        message = "Please log in again.";
      }

      setErrorMessage(message);

    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="create-post-page">

      <div className="create-post-container">

        <Link to="/" className="create-post-back">
          <FiArrowLeft size={18} />
          Back to Feed
        </Link>

        <div className="create-post-heading">
          <span>SHARE YOUR STORY</span>

          <h1>Create a Post</h1>

          <p>
            What's on your mind? Share it with your community.
          </p>
        </div>

        <form
          className="create-post-card"
          onSubmit={handleSubmit}
        >

          <div className="create-post-card-header">

            <div className="create-post-icon">
              <FiEdit3 size={24} />
            </div>

            <div>
              <h2>New Post</h2>
              <p>
                <FiGlobe size={14} />
                Share with the community
              </p>
            </div>

          </div>

          <div className="create-post-field">

            <label htmlFor="post-body">
              Your Story
            </label>

            <textarea
              id="post-body"
              placeholder="What would you like to share today?"
              value={body}
              onChange={(event) =>
                setBody(event.target.value)
              }
              rows={7}
              required
            />

          </div>

          <div className="create-post-image-area">

            <label
              htmlFor="post-image"
              className="create-post-image-label"
            >
              <FiImage size={22} />
              Add a Photo
            </label>

            <input
              id="post-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />

            <span>Optional image, up to 5 MB</span>

          </div>

          {preview && (
            <div className="create-post-preview">

              <img
                src={preview}
                alt="Selected post preview"
              />

              <button
                type="button"
                onClick={removeImage}
                aria-label="Remove image"
              >
                <FiX size={20} />
              </button>

            </div>
          )}

          {errorMessage && (
            <div
              className="create-post-error"
              role="alert"
            >
              {errorMessage}
            </div>
          )}

          <div className="create-post-actions">

            <Link to="/" className="create-post-cancel">
              Cancel
            </Link>

            <button
              type="submit"
              className="create-post-submit"
              disabled={loading}
            >
              <FiSend size={17} />

              {loading ? "Publishing..." : "Publish Post"}

            </button>

          </div>

        </form>

      </div>

    </main>
  );
}

export default CreatePost;
