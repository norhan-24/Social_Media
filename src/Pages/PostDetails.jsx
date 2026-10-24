
import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useParams,
} from "react-router-dom";

import {
  FiArrowLeft,
  FiMessageCircle,
  FiSend,
  FiEdit2,
  FiTrash2,
  FiSave,
  FiX,
  FiUser,
  FiHeart,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
} from "react-icons/fi";

import api from "../services/api";
import "./PostDetails.css";

function readSavedPost(postId) {
  try {
    const saved = sessionStorage.getItem(
      `social_post_${postId}`
    );

    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function getUserId(user) {
  if (typeof user === "string") return user;

  return user?._id || user?.id || null;
}

function getErrorMessage(error) {
  const data = error.response?.data;

  if (Array.isArray(data?.errors) && data.errors.length) {
    return data.errors.join(" - ");
  }

  return (
    data?.message ||
    error.message ||
    "Something went wrong."
  );
}

function formatDate(date) {
  if (!date) return "";

  const value = new Date(date);

  if (isNaN(value.getTime())) return "";

  return value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function PostDetails() {
  const { postId } = useParams();
  const location = useLocation();

  const [post] = useState(
    () => location.state?.post || readSavedPost(postId)
  );

  const [comments, setComments] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalPages, setTotalPages] = useState(null);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const [refreshCount, setRefreshCount] = useState(0);

  const commentsPerPage = 10;

  useEffect(() => {
    if (post) {
      sessionStorage.setItem(
        `social_post_${postId}`,
        JSON.stringify(post)
      );
    }
  }, [post, postId]);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const response = await api.get("/users/profile-data");

        const data = response.data?.data;
        const user = data?.user || data?.profile || data;

        if (active) {
          setCurrentUserId(
            getUserId(user) ||
            getUserId(user?.user)
          );
        }
      } catch (error) {
        console.error("Profile error:", error);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadComments() {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await api.get(
          `/posts/${postId}/comments`,
          {
            params: {
              page: page,
              limit: commentsPerPage,
            },
          }
        );

        const data = response.data?.data;

        const receivedComments =
          data?.comments ||
          data?.items ||
          (Array.isArray(data) ? data : null);

        if (!Array.isArray(receivedComments)) {
          throw new Error(
            "Unexpected comments response from API."
          );
        }

        const pagination =
          response.data?.meta?.pagination ||
          response.data?.meta ||
          data?.pagination ||
          {};

        const pages =
          pagination.numberOfPages ||
          pagination.totalPages ||
          null;

        if (active) {
          setComments(receivedComments);
          setTotalPages(pages ? Number(pages) : null);

          if (pages) {
            setHasNextPage(page < Number(pages));
          } else {
            setHasNextPage(
              receivedComments.length === commentsPerPage
            );
          }
        }
      } catch (error) {
        if (active) {
          setErrorMessage(getErrorMessage(error));
          setComments([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadComments();

    return () => {
      active = false;
    };
  }, [postId, page, refreshCount]);

  function refreshComments() {
    setRefreshCount((count) => count + 1);
  }

  function getCommentAuthor(comment) {
    return (
      comment.commentCreator ||
      comment.user ||
      comment.author ||
      comment.createdBy ||
      {}
    );
  }

  function isCommentOwner(comment) {
    const author = getCommentAuthor(comment);

    const ownerId =
      getUserId(author) ||
      comment.userId ||
      comment.authorId;

    return Boolean(
      currentUserId &&
      ownerId &&
      String(currentUserId) === String(ownerId)
    );
  }

  function isPostOwner() {
    const ownerId = getUserId(
      post?.user || post?.author
    );

    return Boolean(
      currentUserId &&
      ownerId &&
      String(currentUserId) === String(ownerId)
    );
  }

  async function handleCreateComment(event) {
    event.preventDefault();

    if (!newComment.trim()) {
      setActionError("Please write a comment.");
      return;
    }

    setBusy("create");
    setActionError("");

    try {
      const response = await api.post(
        `/posts/${postId}/comments`,
        {
          content: newComment.trim(),
        }
      );

      if (response.data?.success === false) {
        throw new Error(
          response.data.message || "Failed to add comment."
        );
      }

      setNewComment("");
      setPage(1);
      refreshComments();
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setBusy("");
    }
  }

  function startEditing(comment) {
    setEditingId(comment._id || comment.id);
    setEditText(
      comment.content || comment.body || comment.text || ""
    );
    setActionError("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditText("");
    setActionError("");
  }

  async function handleUpdateComment(commentId) {
    if (!editText.trim()) {
      setActionError("Comment cannot be empty.");
      return;
    }

    setBusy(`edit-${commentId}`);
    setActionError("");

    try {
      const response = await api.put(
        `/posts/${postId}/comments/${commentId}`,
        {
          content: editText.trim(),
        }
      );

      if (response.data?.success === false) {
        throw new Error(
          response.data.message || "Failed to edit comment."
        );
      }

      cancelEditing();
      refreshComments();
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setBusy("");
    }
  }

  async function handleDeleteComment(commentId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?"
    );

    if (!confirmed) return;

    setBusy(`delete-${commentId}`);
    setActionError("");

    try {
      const response = await api.delete(
        `/posts/${postId}/comments/${commentId}`
      );

      if (response.data?.success === false) {
        throw new Error(
          response.data.message || "Failed to delete comment."
        );
      }

      if (comments.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        refreshComments();
      }
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setBusy("");
    }
  }

  const postAuthor = post?.user || post?.author || {};
  const postAuthorName = postAuthor.name || "Unknown User";

  const postPhoto =
    postAuthor.photo ||
    postAuthor.profilePicture ||
    postAuthor.avatar;

  return (
    <main className="details-page">
      <div className="details-container">

        <Link to="/" className="details-back">
          <FiArrowLeft size={19} />
          Back to Home
        </Link>

        <div className="details-heading">
          <span>YOUR COMMUNITY</span>
          <h1>Post Details</h1>
          <p>Read the story and join the conversation.</p>
        </div>

        {post ? (
          <article className="details-post">
            <div className="details-author">
              {typeof postPhoto === "string" && postPhoto ? (
                <img src={postPhoto} alt={postAuthorName} />
              ) : (
                <div className="details-avatar">
                  <FiUser size={24} />
                </div>
              )}

              <div>
                <h2>{postAuthorName}</h2>
                <p>{formatDate(post.createdAt)}</p>
              </div>
            </div>

            {post.body && (
              <p className="details-post-text">{post.body}</p>
            )}

            {typeof post.image === "string" && post.image && (
              <img
                src={post.image}
                alt="Post"
                className="details-post-image"
              />
            )}

            <div className="details-post-footer">
              <span>
                <FiHeart size={18} />
                {post.likesCount ??
                  (Array.isArray(post.likes)
                    ? post.likes.length
                    : 0)} Likes
              </span>

              <span>
                <FiMessageCircle size={18} />
                Comments
              </span>
            </div>
          </article>
        ) : (
          <div className="details-not-found">
            <h2>Post preview is unavailable</h2>
            <p>
              Open the post from Home Feed to see its
              details. You can still view its comments below.
            </p>
            <Link to="/">Go to Home</Link>
          </div>
        )}

        <section className="details-comments">

          <div className="details-comments-heading">
            <div>
              <FiMessageCircle size={24} />
              <h2>Comments</h2>
            </div>

            <button
              type="button"
              onClick={refreshComments}
              disabled={loading}
            >
              <FiRefreshCw size={17} />
              Refresh
            </button>
          </div>

          <form
            className="details-comment-form"
            onSubmit={handleCreateComment}
          >
            <label htmlFor="new-comment">
              Leave a comment
            </label>

            <textarea
              id="new-comment"
              value={newComment}
              onChange={(event) =>
                setNewComment(event.target.value)
              }
              placeholder="Write something nice..."
              rows={3}
              required
            />

            <button
              type="submit"
              disabled={busy !== ""}
            >
              <FiSend size={17} />
              {busy === "create"
                ? "Posting..."
                : "Post Comment"}
            </button>
          </form>

          {actionError && (
            <div className="details-error" role="alert">
              {actionError}
            </div>
          )}

          {loading ? (
            <div className="details-status">
              Loading comments...
            </div>
          ) : errorMessage ? (
            <div className="details-status">
              <p>{errorMessage}</p>
              <button
                type="button"
                onClick={refreshComments}
              >
                Try Again
              </button>
            </div>
          ) : comments.length === 0 ? (
            <div className="details-status">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <>
              <div className="details-comments-list">
                {comments.map((comment) => {
                  const commentId =
                    comment._id || comment.id;

                  const author = getCommentAuthor(comment);

                  const authorName =
                    author.name ||
                    author.username ||
                    "Community Member";

                  const photo =
                    author.photo ||
                    author.profilePicture ||
                    author.avatar;

                  const canEdit = isCommentOwner(comment);

                  const canDelete =
                    canEdit || isPostOwner();

                  const isEditing =
                    String(editingId) === String(commentId);

                  return (
                    <article
                      className="details-comment"
                      key={commentId}
                    >
                      <div className="details-comment-top">

                        {typeof photo === "string" && photo ? (
                          <img
                            src={photo}
                            alt={authorName}
                            className="details-comment-avatar"
                          />
                        ) : (
                          <div className="details-comment-avatar details-comment-fallback">
                            <FiUser size={19} />
                          </div>
                        )}

                        <div className="details-comment-person">
                          <h3>{authorName}</h3>
                          <span>
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>

                      </div>

                      {isEditing ? (
                        <div className="details-edit-form">

                          <textarea
                            value={editText}
                            onChange={(event) =>
                              setEditText(event.target.value)
                            }
                            rows={3}
                          />

                          <div className="details-edit-actions">
                            <button
                              type="button"
                              className="details-cancel"
                              onClick={cancelEditing}
                              disabled={busy !== ""}
                            >
                              <FiX size={16} />
                              Cancel
                            </button>

                            <button
                              type="button"
                              className="details-save"
                              onClick={() =>
                                handleUpdateComment(commentId)
                              }
                              disabled={busy !== ""}
                            >
                              <FiSave size={16} />
                              {busy === `edit-${commentId}`
                                ? "Saving..."
                                : "Save"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="details-comment-text">
                          {comment.content ||
                            comment.body ||
                            comment.text ||
                            ""}
                        </p>
                      )}

                      {!isEditing && (canEdit || canDelete) && (
                        <div className="details-comment-actions">

                          {canEdit && (
                            <button
                              type="button"
                              onClick={() =>
                                startEditing(comment)
                              }
                              disabled={busy !== ""}
                            >
                              <FiEdit2 size={15} />
                              Edit
                            </button>
                          )}

                          {canDelete && (
                            <button
                              type="button"
                              className="details-delete"
                              onClick={() =>
                                handleDeleteComment(commentId)
                              }
                              disabled={busy !== ""}
                            >
                              <FiTrash2 size={15} />
                              {busy === `delete-${commentId}`
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          )}

                        </div>
                      )}

                    </article>
                  );
                })}
              </div>

              <div className="details-pagination">
                <button
                  type="button"
                  onClick={() =>
                    setPage((current) => current - 1)
                  }
                  disabled={page === 1 || loading}
                >
                  <FiChevronLeft size={17} />
                  Previous
                </button>

                <span>
                  Page {page}
                  {totalPages ? ` of ${totalPages}` : ""}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setPage((current) => current + 1)
                  }
                  disabled={!hasNextPage || loading}
                >
                  Next
                  <FiChevronRight size={17} />
                </button>
              </div>
            </>
          )}

        </section>

      </div>
    </main>
  );
}

export default PostDetails;
