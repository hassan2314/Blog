import React, { useEffect, useState } from "react";
import { PostCard, Container } from "../components";
import appwriteServices from "../appwrite/config";
import { Skeleton } from "../components"; // You'll need to create a Skeleton component

const AllPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const posts = await appwriteServices.getPosts([]);
        if (posts) {
          setPosts(posts.documents);
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error);
        setError("Failed to load posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []); // Removed empty dependency array from original code

  if (loading) {
    return (
      <div className="w-full py-12">
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Skeleton key={index} className="h-80" />
            ))}
          </div>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-12">
        <Container>
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
        </Container>
      </div>
    );
  }

  return (
    <div className="w-full py-12">
      <Container>
        <h1 className="text-3xl font-bold text-gray-800 mb-8">All Posts</h1>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No posts found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.$id} post={post} />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
};

export default AllPosts;
