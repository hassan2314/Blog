import React from "react";
import { Link } from "react-router-dom";
import appWriteServices from "../appwrite/config";

function PostCard({ post }) {
  // Guard against undefined post
  if (!post) {
    console.warn('PostCard received undefined post prop');
    return (
      <div className="w-full bg-gray-100 rounded-xl overflow-hidden shadow-md h-full flex flex-col animate-pulse">
        <div className="w-full h-48 bg-gray-300"></div>
        <div className="p-5 flex-grow">
          <div className="h-6 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-20"></div>
        </div>
      </div>
    );
  }

  // Safely destructure with fallback values
  const { 
    $id, 
    title = 'Untitled Post', 
    featuredimage, 
    excerpt 
  } = post;

  // Additional safety checks
  if (!$id) {
    console.error('PostCard: Post missing required $id field', post);
    return (
      <div className="w-full bg-red-50 border border-red-200 rounded-xl overflow-hidden shadow-md h-full flex flex-col">
        <div className="p-5 flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-2">⚠️</div>
            <p className="text-red-800 text-sm">Post missing ID</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link to={`/post/${$id}`} className="group">
      <div className="w-full bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
        <div className="w-full h-48 overflow-hidden">
          {featuredimage ? (
            <img
              src={appWriteServices.getImagePreview(featuredimage)}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk3YTNiNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-sm">No Image</span>
            </div>
          )}
        </div>
        <div className="p-5 flex-grow">
          <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
            {title}
          </h2>
          {excerpt && (
            <p className="text-gray-600 mb-4 line-clamp-3">{excerpt}</p>
          )}
          <div className="text-indigo-600 font-medium group-hover:text-indigo-800 transition-colors">
            Read more →
          </div>
        </div>
      </div>
    </Link>
  );
}

export default PostCard;
