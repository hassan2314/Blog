import React from "react";
import { Link } from "react-router-dom";
import appWriteServices from "../appwrite/config";

function PostCard({ post }) {
  const { $id, title, featuredimage, excerpt } = post;

  return (
    <Link to={`/post/${$id}`} className="group">
      <div className="w-full bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
        <div className="w-full h-48 overflow-hidden">
          <img
            src={appWriteServices.getImagePreview(featuredimage)}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
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
