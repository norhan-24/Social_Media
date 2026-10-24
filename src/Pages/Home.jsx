
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  FiHome,
  FiUser,
  FiSettings,
  FiRefreshCw,
  FiStar,
  FiUsers,
  FiArrowRight,
  FiArrowUpRight,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import api from "../services/api";
import PostCard from "../components/PostCard";

import "./Home.css";
import "../components/ReactIcons.css";

function Home() {
  const [posts, setPosts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  const postsPerPage = 10;

  useEffect(() => {
    let active = true;

    async function getProfile() {
      try {
        const response = await api.get("/users/profile-data");

        const data = response.data?.data;

        const user =
          data?.user ||
          data?.profile ||
          data;

        const userId =
          user?._id ||
          user?.id ||
          user?.user?._id ||
          user?.user?.id;

        if (active) {
          setCurrentUserId(userId || null);
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    }

    getProfile();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function getPosts() {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await api.get("/posts", {
          params: {
            page: page,
            limit: postsPerPage,
          },
        });

        const receivedPosts = response.data?.data?.posts;

        if (!Array.isArray(receivedPosts)) {
          throw new Error("Unexpected posts response.");
        }

        const pagination =
          response.data?.meta?.pagination ||
          response.data?.data?.pagination ||
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
          const message =
            error.response?.data?.message ||
            error.message ||
            "Failed to load posts.";

          setErrorMessage(message);
          setPosts([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    getPosts();

    return () => {
      active = false;
    };
  }, [page, refreshCount]);

  function getPostOwnerId(post) {
    const owner = post.user || post.author;

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

  function getErrorMessage(error, fallback) {
    const data = error.response?.data;

    if (
      Array.isArray(data?.errors) &&
      data.errors.length > 0
    ) {
      return data.errors.join(" - ");
    }

    return data?.message || error.message || fallback;
  }

  function refreshPosts() {
    setRefreshCount((count) => count + 1);
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

      refreshPosts();
    } catch (error) {
      if (
        error.response?.status === 404 ||
        error.response?.status === 405
      ) {
        throw new Error(
          "The API did not accept the delete endpoint. Please verify the delete route.",
          { cause: error }
        );
      }

      throw new Error(
        getErrorMessage(error, "Failed to delete post."),
        { cause: error }
      );
    }
  }

  function nextPage() {
    if (!hasNextPage) return;

    setPage((current) => current + 1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function previousPage() {
    if (page <= 1) return;

    setPage((current) => current - 1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <main className="home-page">
      <div className="home-layout">

        <aside className="home-sidebar">
          <div className="home-sidebar-card">

            <div className="home-sidebar-heading">
              <div className="home-sidebar-icon">
                <FiStar size={24} />
              </div>

              <div>
                <h2>Social Media</h2>
                <p>Your community</p>
              </div>
            </div>

            <nav className="home-sidebar-links">
              <Link to="/" className="home-sidebar-active">
                <FiHome size={20} />
                Home Feed
              </Link>

              <Link to="/profile">
                <FiUser size={20} />
                My Profile
              </Link>

              <Link to="/change-password">
                <FiSettings size={20} />
                Settings
              </Link>
            </nav>

          </div>

          <div className="home-sidebar-note">
            <span>COMMUNITY</span>

            <h3>Every story matters.</h3>

            <p>
              Discover ideas and share moments
              with people around the world.
            </p>
          </div>
        </aside>

        <section className="home-feed">

          <div className="home-feed-header">
            <div>
              <span className="home-feed-label">
                YOUR COMMUNITY
              </span>

              <h1>
                Home Feed<span>.</span>
              </h1>

              <p>Catch up with the latest stories.</p>
            </div>

            <button
              type="button"
              className="home-refresh"
              onClick={refreshPosts}
              disabled={loading}
            >
              <FiRefreshCw size={17} />
              Refresh
            </button>
          </div>

          <div className="home-feed-banner">
            <div>
              <span>STAY CONNECTED</span>

              <h2>Good stories bring us together.</h2>

              <p>
                Explore what everyone is sharing today.
              </p>
            </div>

            <div className="home-banner-circle">
              <FiStar size={65} />
            </div>
          </div>

          {loading ? (
            <div className="home-message-card">
              <div className="home-loader"></div>
              <p>Loading posts...</p>
            </div>
          ) : errorMessage ? (
            <div className="home-message-card">
              <h3>Something went wrong</h3>
              <p>{errorMessage}</p>

              <button
                type="button"
                onClick={refreshPosts}
              >
                Try Again
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="home-message-card">
              <h3>No posts yet</h3>
              <p>There are no posts to display.</p>
            </div>
          ) : (
            <>
              <div className="home-posts-list">
                {posts.map((post) => {
                  const ownerId = getPostOwnerId(post);

                  const canManage = Boolean(
                    currentUserId &&
                    ownerId &&
                    String(currentUserId) === String(ownerId)
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

              <div className="home-pagination">
                <button
                  type="button"
                  onClick={previousPage}
                  disabled={page === 1}
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
                  onClick={nextPage}
                  disabled={!hasNextPage}
                >
                  Next
                  <FiChevronRight size={17} />
                </button>
              </div>
            </>
          )}

        </section>

        <aside className="home-right-sidebar">

          <div className="home-right-card">
            <div className="home-right-icon">
              <FiUsers size={32} />
            </div>

            <h3>Welcome to the community!</h3>

            <p>
              Your space to connect, discover
              new perspectives and share stories.
            </p>

            <Link to="/profile">
              View Profile
              <FiArrowRight size={16} />
            </Link>
          </div>

          <div className="home-quick-links">
            <h3>Quick Links</h3>

            <Link to="/">
              Explore Posts
              <FiArrowUpRight size={16} />
            </Link>

            <Link to="/profile">
              My Profile
              <FiArrowUpRight size={16} />
            </Link>

            <Link to="/change-password">
              Account Settings
              <FiArrowUpRight size={16} />
            </Link>
          </div>

        </aside>

      </div>
    </main>
  );
}

export default Home;
