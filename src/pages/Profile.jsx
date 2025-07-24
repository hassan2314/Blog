import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Query } from 'appwrite';
import { Container, PostCard, LoadingSpinner, UserProfile } from '../components';
import appwriteService from '../appwrite/config';

export default function Profile() {
  const { userId } = useParams();
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserPosts();
  }, [userId]);

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await appwriteService.getPosts([
        Query.equal('userId', userId),
        Query.equal('status', true),
        Query.orderDesc('createdAt')
      ]);
      
      if (response && response.documents) {
        setUserPosts(response.documents);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setError('Failed to load user posts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="flex justify-center py-12">
          <LoadingSpinner className="w-12 h-12" />
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-md mx-auto">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="space-y-8">
        {/* User Profile Section */}
        <div className="max-w-2xl mx-auto">
          <UserProfile userId={userId} />
        </div>

        {/* User's Posts Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Posts ({userPosts.length})
            </h2>
          </div>

          {userPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-50 rounded-lg p-8">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No posts yet
                </h3>
                <p className="text-gray-600">
                  This user hasn't published any posts yet.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userPosts.map((post) => (
                <PostCard key={post.$id} {...post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}