
import { useState } from "react";
import { Link } from "react-router-dom";

import {
  FiHeart,
  FiMessageCircle,
  FiArrowRight,
  FiGlobe,
  FiEdit2,
  FiTrash2,
  FiImage,
  FiSave,
  FiX,
} from "react-icons/fi";

import "./PostCard.css";
import "./PostActions.css";
import "./ReactIcons.css";

function PostCard({ post, canManage, onUpdate, onDelete }) {
  const author = post.user || post.author || {};

  const authorName = author.name || "Unknown User";
  const authorUsername = author.username || "community";

  const authorPhoto =
    author.photo ||
    author.profilePicture ||
    author.avatar ||
    null;

  const postId = post._id || post.id;

  const likesCount =
    post.likesCount ??
    (Array.isArray(post.likes) ? post.likes.length : 0);

  const commentsCount =
    post.commentsCount ??
    (Array.isArray(post.comments) ? post.comments.length : 0);

  const [isEditing, setIsEditing] = useState(false);
  const [editBody, setEditBody] = useState(post.body || "");
  const [editImage, setEditImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function formatDate(date) {
    if (!date) return "";

    const value = new Date(date);

    if (isNaN(value.getTime())) return "";

    return value.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function startEditing() {
    setEditBody(post.body || "");
    setEditImage(null);
    setErrorMessage("");
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setEditImage(null);
    setErrorMessage("");
  }

  function handleImageChange(event) {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please choose a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image must be smaller than 5 MB.");
      return;
    }

    setEditImage(file);
    setErrorMessage("");
  }

  async function handleUpdate(event) {
    event.preventDefault();

    if (!canManage || !postId || !onUpdate) return;

    if (!editBody.trim()) {
      setErrorMessage("Post text cannot be empty.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const formData = new FormData();

      formData.append("body", editBody.trim());

      if (editImage) {
        formData.append("image", editImage);
      }

      await onUpdate(postId, formData);

      setIsEditing(false);
      setEditImage(null);
    } catch (error) {
      setErrorMessage(error.message || "Update failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!canManage || !postId || !onDelete) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );

    if (!confirmed) return;

    setLoading(true);
    setErrorMessage("");

    try {
      await onDelete(postId);
    } catch (error) {
      setErrorMessage(error.message || "Delete failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="post-card">
      <div className="post-card-header">
        <div className="post-card-user">
          {typeof authorPhoto === "string" && authorPhoto ? (
            <img
              src={authorPhoto}
              alt={authorName}
              className="post-card-avatar"
            />
          ) : (
            <div className="post-card-avatar-fallback">
              {authorName.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="post-card-user-info">
            <h3>{authorName}</h3>
            <p>
              @{authorUsername}
              <span> · </span>
              {formatDate(post.createdAt)}
            </p>
          </div>
        </div>

        <span className="post-card-public">
          <FiGlobe size={14} />
          Public
        </span>
      </div>

      {canManage && !isEditing && (
        <div className="post-management">
          <button
            type="button"
            className="post-edit-btn"
            onClick={startEditing}
            disabled={loading}
          >
            <FiEdit2 size={16} />
            Edit
          </button>

          <button
            type="button"
            className="post-delete-btn"
            onClick={handleDelete}
            disabled={loading}
          >
            <FiTrash2 size={16} />
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      )}

      {isEditing ? (
        <form className="post-edit-form" onSubmit={handleUpdate}>
          <label htmlFor={`edit-${postId}`}>
            Edit your post
          </label>

          <textarea
            id={`edit-${postId}`}
            value={editBody}
            onChange={(event) =>
              setEditBody(event.target.value)
            }
            rows={5}
            required
          />

          <div className="post-edit-image">
            <label htmlFor={`image-${postId}`}>
              <FiImage size={18} />
              {editImage ? editImage.name : "Replace Image"}
            </label>

            <input
              id={`image-${postId}`}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          <div className="post-edit-actions">
            <button
              type="button"
              className="post-cancel-btn"
              onClick={cancelEditing}
              disabled={loading}
            >
              <FiX size={17} />
              Cancel
            </button>

            <button
              type="submit"
              className="post-save-btn"
              disabled={loading}
            >
              <FiSave size={17} />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      ) : (
        <div className="post-card-body">
          {post.body && (
            <p className="post-card-text">{post.body}</p>
          )}

          {typeof post.image === "string" && post.image && (
            <img
              src={post.image}
              alt="Post"
              className="post-card-image"
              loading="lazy"
            />
          )}
        </div>
      )}

      {errorMessage && (
        <div className="post-action-error" role="alert">
          {errorMessage}
        </div>
      )}

      <div className="post-card-stats">
        <span>
          <FiHeart size={17} className="post-heart" />
          {likesCount} Likes
        </span>

        <span>
          <FiMessageCircle size={17} />
          {commentsCount} Comments
        </span>
      </div>

      <div className="post-card-actions">
        <span className="post-card-count">
          <FiHeart size={19} />
          Likes
        </span>

        <Link
          to={`/post/${postId}`}
          state={{ post }}
        >
          <FiMessageCircle size={19} />
          Comments
        </Link>

        <Link
          to={`/post/${postId}`}
          state={{ post }}
          className="post-card-details"
        >
          View Post
          <FiArrowRight size={17} />
        </Link>
      </div>
    </article>
  );
}

export default PostCard;
