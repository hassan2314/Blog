import React, { useEffect, useState } from "react";
import { Container, PostCard, Skeleton } from "../components";
import service from "../appwrite/config";
import AdminSetupHelper from "../components/AdminSetupHelper";

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await service.getPosts();
        if (response) {
          setPosts(response.documents);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} />
          ))}
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <AdminSetupHelper />
      
      <div className="py-8">
        {posts.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Latest Posts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post.$id} {...post} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to MegaBlog
            </h2>
            <p className="text-gray-600 mb-8">
              No posts available yet. Be the first to create one!
            </p>
          </div>
        )}
      </div>
    </Container>
  );
}

export default Home;
