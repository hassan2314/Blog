import React, { useEffect, useState } from "react";
import { Container, PostForm, LoadingSpinner } from "../components";
import appwriteService from "../appwrite/config.js";
import { useParams, useNavigate } from "react-router-dom";

const EditPost = () => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!slug) {
          navigate("/");
          return;
        }

        const postData = await appwriteService.getPost(slug);

        if (!postData) {
          throw new Error("Post not found");
        }

        setPost(postData);
      } catch (error) {
        console.error("Error fetching post:", error);
        setError(error.message);
        navigate("/", { state: { error: "Failed to load post" } });
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, navigate]);

  if (loading) {
    return (
      <Container>
        <div className="flex justify-center items-center min-h-[300px]">
          <LoadingSpinner className="w-12 h-12 text-indigo-600" />
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="bg-red-50 border-l-4 border-red-400 p-4 my-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading post
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Container>
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Edit Post</h1>
          {post && <PostForm post={post} />}
        </div>
      </Container>
    </div>
  );
};

export default EditPost;
