import React, { useState } from "react";
import { useSelector } from "react-redux";
import { formatDistanceToNow } from "date-fns";
import { FiTrash2, FiUser } from "react-icons/fi";
import CommentForm from "./CommentForm";
import appwriteService from "../../appwrite/config";
import toast from "react-hot-toast";

export default function CommentItem({
  comment,
  onCommentDeleted,
  onReplyAdded,
  postData = null,
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const userData = useSelector((state) => state.auth.userData);

  const isAuthor = userData && comment.userId === userData.$id;
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
  });

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const success = await appwriteService.deleteComment(comment.$id);
      if (success) {
        onCommentDeleted(comment.$id);
        toast.success("Comment deleted successfully");
      } else {
        toast.error("Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReplyAdded = (newReply) => {
    onReplyAdded(newReply);
    setShowReplyForm(false);
  };

  return (
    <div className="border-l-2 border-gray-200 pl-4 py-3">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
            <FiUser className="w-4 h-4 text-indigo-600" />
          </div>
        </div>

        <div className="flex-grow">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-gray-900">Anonymous User</span>
            <span className="text-sm text-gray-500">{timeAgo}</span>
          </div>

          <p className="text-gray-700 mb-3">{comment.content}</p>

          <div className="flex items-center space-x-4">
            {userData && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center space-x-1 text-sm text-indigo-600 hover:text-indigo-800"
              >
                {/* {<FiReply className="w-4 h-4" />} */}
                <span>Reply</span>
              </button>
            )}

            {isAuthor && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
              >
                <FiTrash2 className="w-4 h-4" />
                <span>{isDeleting ? "Deleting..." : "Delete"}</span>
              </button>
            )}
          </div>

          {showReplyForm && (
            <div className="mt-4">
              <CommentForm
                postId={comment.postId}
                parentId={comment.$id}
                onCommentAdded={handleReplyAdded}
                postData={postData}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
