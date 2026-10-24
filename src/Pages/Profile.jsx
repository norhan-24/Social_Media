
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  FiUser,
  FiMail,
  FiCalendar,
  FiLock,
  FiPlusCircle,
  FiRefreshCw,
  FiFileText,
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
  FiStar,
  FiAtSign,
} from "react-icons/fi";

import api from "../services/api";
import PostCard from "../components/PostCard";

import "./Profile.css";

function Profile() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  const [profileLoading, setProfileLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);

  const [profileError, setProfileError] = useState("");
  const [postsError, setPostsError] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  const postsPerPage = 10;

  useEffect(() => {
    let active = true;

    async function getProfile() {
      setProfileLoading(true);
      setProfileError("");

      try {
        const response = await api.get("/users/profile-data");

        const data = response.data?.data;

        const profile =
          data?.user ||
          data?.profile ||
          data;

        if (!profile || typeof profile !== "object") {
          throw new Error("Profile data is unavailable.");
        }

        if (active) {
          setUser(profile);
        }
      } catch (error) {
        if (active) {
          setProfileError(
            error.response?.data?.message ||
            error.message ||
            "Failed to load profile."
          );
        }
      } finally {
        if (active) {
          setProfileLoading(false);
        }
      }
    }

    getProfile();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function getMyPosts() {
      setPostsLoading(true);
      setPostsError("");

      try {
        const response = await api.get("/posts/feed", {
          params: {
            only: "me",
            page: page,
            limit: postsPerPage,
          },
        });

        const data = response.data?.data;

        const receivedPosts =
          data?.posts ||
          data?.items ||
          (Array.isArray(data) ? data : null);

        if (!Array.isArray(receivedPosts)) {
          throw new Error("Unexpected posts response.");
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
          setPosts(receivedPosts);

          setTotalPages(pages ? Number(pages) : null);

          if (pages) {
            setHasNextPage(page < Number(pages));
          } else {
            setHasNextPage(
              receivedPosts.length === postsPerPage
            );
          }
        }
      } catch (error) {
        if (active) {
          setPostsError(
            error.response?.data?.message ||
            error.message ||
            "Failed to load your posts."
          );

          setPosts([]);
        }
      } finally {
        if (active) {
          setPostsLoading(false);
        }
      }
    }

    getMyPosts();

    return () => {
      active = false;
    };
  }, [page, refreshCount]);

  function refreshPosts() {
    setRefreshCount((count) => count + 1);
  }

  function getErrorMessage(error, fallback) {
    const data = error.response?.data;

    if (Array.isArray(data?.errors) && data.errors.length) {
      return data.errors.join(" - ");
    }

    return data?.message || error.message || fallback;
  }

  function getPostOwnerId(post) {
    const owner =
      post.user ||
      post.author ||
      post.createdBy;

    if (typeof owner === "string") {
      return owner;
    }

    return (
      owner?._id ||
      owner?.id ||
      post.userId ||
      post.authorId ||
      null
    );
  }

  async function updatePost(postId, formData) {
    try {
      const response = await api.put(
        `/posts/${postId}`,
        formData
      );

      if (response.data?.success === false) {
        throw new Error(
          response.data.message || "Update failed."
        );
      }

      refreshPosts();
    } catch (error) {
      throw new Error(
        getErrorMessage(error, "Failed to update post."),
        { cause: error }
      );
    }
  }

  async function deletePost(postId) {
    try {
      const response = await api.delete(
        `/posts/${postId}`
      );

      if (response.data?.success === false) {
        throw new Error(
          response.data.message || "Delete failed."
        );
      }

      if (posts.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        refreshPosts();
      }
    } catch (error) {
      if (
        error.response?.status === 404 ||
        error.response?.status === 405
      ) {
        throw new Error(
          "The API did not accept the delete endpoint.",
          { cause: error }
        );
      }

      throw new Error(
        getErrorMessage(error, "Failed to delete post."),
        { cause: error }
      );
    }
  }

  function formatDate(date) {
    if (!date) return "Not available";

    const value = new Date(date);

    if (isNaN(value.getTime())) {
      return "Not available";
    }

    return value.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  const displayName = user?.name || "Community Member";

  const username = user?.username || "";

  const avatar =
    user?.photo ||
    user?.profilePicture ||
    user?.avatar ||
    null;

  const profileId = user?._id || user?.id;

  return (
    <main className="profile-page">
      <div className="profile-container">

        <div className="profile-cover">
          <div className="profile-cover-content">
            <FiStar size={32} />
            <span>YOUR PERSONAL SPACE</span>
          </div>
        </div>

        <section className="profile-info-card">

          {profileLoading ? (
            <div className="profile-loading">
              Loading your profile...
            </div>
          ) : profileError ? (
            <div className="profile-error">
              {profileError}
            </div>
          ) : (
            <>
              <div className="profile-top">

                <div className="profile-user-section">

                  {typeof avatar === "string" && avatar ? (
                    <img
                      src={avatar}
                      alt={displayName}
                      className="profile-avatar"
                    />
                  ) : (
                    <div className="profile-avatar-placeholder">
                      <FiUser size={42} />
                    </div>
                  )}

                  <div className="profile-user-text">
                    <h1>{displayName}</h1>

                    {username && (
                      <p className="profile-username">
                        @{username}
                      </p>
                    )}

                    <p className="profile-bio">
                      Welcome to your personal space.
                    </p>
                  </div>

                </div>

                <div className="profile-buttons">

                  <Link
                    to="/create-post"
                    className="profile-new-post"
                  >
                    <FiPlusCircle size={17} />
                    New Post
                  </Link>

                  <Link
                    to="/change-password"
                    className="profile-settings-button"
                  >
                    <FiLock size={17} />
                    Change Password
                  </Link>

                </div>

              </div>

              <div className="profile-details-grid">

                <div className="profile-detail-item">
                  <FiMail size={19} />

                  <div>
                    <span>Email Address</span>
                    <p>{user?.email || "Not available"}</p>
                  </div>
                </div>

                <div className="profile-detail-item">
                  <FiAtSign size={19} />

                  <div>
                    <span>Username</span>
                    <p>
                      {username ? `@${username}` : "Not available"}
                    </p>
                  </div>
                </div>

                <div className="profile-detail-item">
                  <FiCalendar size={19} />

                  <div>
                    <span>Date of Birth</span>
                    <p>{formatDate(user?.dateOfBirth)}</p>
                  </div>
                </div>

                <div className="profile-detail-item">
                  <FiUser size={19} />

                  <div>
                    <span>Gender</span>
                    <p>
                      {user?.gender
                        ? user.gender.charAt(0).toUpperCase() +
                          user.gender.slice(1)
                        : "Not available"}
                    </p>
                  </div>
                </div>

              </div>

            </>
          )}

        </section>

        <section className="profile-posts-section">

          <div className="profile-posts-heading">

            <div>
              <span>YOUR CONTENT</span>
              <h2>My Posts</h2>
              <p>Manage the stories you've shared.</p>
            </div>

            <div className="profile-posts-tools">
              <span className="profile-posts-count">
                <FiFileText size={17} />
                {posts.length} on this page
              </span>

              <button
                type="button"
                onClick={refreshPosts}
                disabled={postsLoading}
              >
                <FiRefreshCw size={17} />
                Refresh
              </button>
            </div>

          </div>

          {postsLoading ? (
            <div className="profile-message">
              <div className="profile-spinner"></div>
              <p>Loading your posts...</p>
            </div>
          ) : postsError ? (
            <div className="profile-message">
              <h3>Couldn't load your posts</h3>
              <p>{postsError}</p>

              <button
                type="button"
                onClick={refreshPosts}
              >
                Try Again
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="profile-message">
              <FiFileText size={42} />
              <h3>No posts to display</h3>

              <p>
                You haven't shared any posts on this page.
              </p>

              <Link to="/create-post">
                Create a Post
                <FiArrowRight size={17} />
              </Link>
            </div>
          ) : (
            <>
              <div className="profile-posts-list">

                {posts.map((post) => {
                  const ownerId = getPostOwnerId(post);

                  const canManage = Boolean(
                    profileId &&
                    ownerId &&
                    String(profileId) === String(ownerId)
                  );

                  return (
                    <PostCard
                      key={post._id || post.id}
                      post={post}
                      canManage={canManage}
                      onUpdate={updatePost}
                      onDelete={deletePost}
                    />
                  );
                })}

              </div>

              <div className="profile-pagination">

                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() =>
                    setPage((current) => current - 1)
                  }
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
                  disabled={!hasNextPage}
                  onClick={() =>
                    setPage((current) => current + 1)
                  }
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

export default Profile;
