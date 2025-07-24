import React, { useState, useEffect } from 'react';
import { FiMessageCircle } from 'react-icons/fi';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import appwriteService from '../../appwrite/config';
import { LoadingSpinner } from '../index';

export default function CommentsList({ postId, postData = null }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await appwriteService.getComments(postId);
      if (response) {
        setComments(response.documents);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentAdded = (newComment) => {
    if (newComment.parentId) {
      // It's a reply, add it to the list
      setComments(prev => [newComment, ...prev]);
    } else {
      // It's a new comment, add it to the beginning
      setComments(prev => [newComment, ...prev]);
    }
  };

  const handleCommentDeleted = (commentId) => {
    setComments(prev => prev.filter(comment => comment.$id !== commentId));
  };

  const handleReplyAdded = (newReply) => {
    setComments(prev => [newReply, ...prev]);
  };

  // Organize comments into threads
  const organizeComments = () => {
    const topLevelComments = comments.filter(comment => !comment.parentId);
    const replies = comments.filter(comment => comment.parentId);
    
    return topLevelComments.map(comment => ({
      ...comment,
      replies: replies.filter(reply => reply.parentId === comment.$id)
    }));
  };

  const organizedComments = organizeComments();

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <FiMessageCircle className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Comments ({organizedComments.length})
        </h3>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <CommentForm postId={postId} onCommentAdded={handleCommentAdded} postData={postData} />

      {organizedComments.length === 0 ? (
        <div className="text-center py-8">
          <FiMessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {organizedComments.map((comment) => (
            <div key={comment.$id} className="space-y-4">
              <CommentItem
                comment={comment}
                onCommentDeleted={handleCommentDeleted}
                onReplyAdded={handleReplyAdded}
                postData={postData}
              />
              
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-8 space-y-4">
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply.$id}
                      comment={reply}
                      onCommentDeleted={handleCommentDeleted}
                      onReplyAdded={handleReplyAdded}
                      postData={postData}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}