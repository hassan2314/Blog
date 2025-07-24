import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '../index';
import appwriteService from '../../appwrite/config';
import { notifyNewComment } from '../../utils/notifications';
import toast from 'react-hot-toast';

export default function CommentForm({ postId, onCommentAdded, parentId = null, postData = null }) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userData = useSelector((state) => state.auth.userData);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userData) {
      toast.error('Please login to comment');
      return;
    }

    if (!content.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setIsSubmitting(true);
    try {
      const comment = await appwriteService.createComment({
        postId,
        userId: userData.$id,
        content: content.trim(),
        parentId,
      });

      if (comment) {
        setContent('');
        onCommentAdded(comment);
        toast.success('Comment added successfully!');
        
        // Send notification to post author (if not commenting on own post)
        if (postData && postData.userId !== userData.$id) {
          notifyNewComment(postData.userId, comment, postData);
        }
      } else {
        toast.error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userData) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg text-center">
        <p className="text-gray-600">Please login to leave a comment</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={parentId ? "Write a reply..." : "Write a comment..."}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          disabled={isSubmitting}
        />
      </div>
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="px-6 py-2"
        >
          {isSubmitting ? 'Posting...' : parentId ? 'Reply' : 'Post Comment'}
        </Button>
      </div>
    </form>
  );
}