import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import appwriteService from "../appwrite/config";
import { Button, Container, LoadingSpinner, CommentsList, SocialShare } from "../components";
import parse from "html-react-parser";
import { useSelector } from "react-redux";
import { ConfirmDialog } from "../components";
import { FiEye, FiCalendar, FiUser } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

export default function Post() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { slug } = useParams();
  const navigate = useNavigate();

  const userData = useSelector((state) => state.auth.userData);
  const isAuthor = post && userData ? post.userId === userData.$id : false;

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (!slug) {
          navigate("/");
          return;
        }

        setLoading(true);
        const postData = await appwriteService.getPost(slug);

        if (!postData) {
          throw new Error("Post not found");
        }

        setPost(postData);
        
        // Increment view count
        appwriteService.incrementViewCount(slug);
      } catch (error) {
        console.error("Error loading post:", error);
        setError(error.message);
        navigate("/", { state: { error: "Failed to load post" } });
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, navigate]);

  const deletePost = async () => {
    try {
      setLoading(true);
      const status = await appwriteService.deletePost(post.$id);

      if (status) {
        await appwriteService.deleteFile(post.featuredimage);
        navigate("/", { state: { message: "Post deleted successfully" } });
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      setError("Failed to delete post. Please try again.");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner className="w-12 h-12 text-indigo-600" />
      </div>
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

  if (!post) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container>
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          {/* Featured Image */}
          <div className="relative h-64 w-full overflow-hidden">
            <img
              src={appwriteService.getImagePreview(post.featuredimage)}
              alt={post.title}
              className="w-full h-full object-cover"
            />

            {isAuthor && (
              <div className="absolute top-4 right-4 flex space-x-2">
                <Link to={`/edit-post/${post.$id}`}>
                  <Button
                    variant="outline"
                    className="bg-white/90 hover:bg-white backdrop-blur-sm"
                  >
                    <svg
                      className="w-5 h-5 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="bg-white/90 hover:bg-white backdrop-blur-sm"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <svg
                    className="w-5 h-5 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete
                </Button>
              </div>
            )}
          </div>

          {/* Post Content */}
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {post.title}
              </h1>
              
              {/* Post Meta */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4 text-gray-500 text-sm">
                  <div className="flex items-center space-x-1">
                    <FiUser className="w-4 h-4" />
                    <span>Posted by {post.username || "Anonymous"}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FiCalendar className="w-4 h-4" />
                    <span>{formatDistanceToNow(new Date(post.$createdAt), { addSuffix: true })}</span>
                  </div>
                  {post.viewCount && (
                    <div className="flex items-center space-x-1">
                      <FiEye className="w-4 h-4" />
                      <span>{post.viewCount} views</span>
                    </div>
                  )}
                </div>
                
                {/* Social Share */}
                <SocialShare
                  url={window.location.href}
                  title={post.title}
                  description={post.content.replace(/<[^>]*>/g, '').substring(0, 150)}
                />
              </div>
              
              {/* Categories and Tags */}
              {(post.categories?.length > 0 || post.tags?.length > 0) && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.categories?.map((categoryId) => (
                    <span
                      key={categoryId}
                      className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full"
                    >
                      Category
                    </span>
                  ))}
                  {post.tags?.map((tagId) => (
                    <span
                      key={tagId}
                      className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full"
                    >
                      #Tag
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="prose max-w-none mb-12">{parse(post.content)}</div>
            
            {/* Comments Section */}
            <div className="border-t border-gray-200 pt-8">
              <CommentsList postId={post.$id} postData={post} />
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={deletePost}
          title="Delete Post"
          message="Are you sure you want to delete this post? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          loading={loading}
        />
      </Container>
    </div>
  );
}
