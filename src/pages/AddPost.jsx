import React from "react";
import { PostForm, Container } from "../components";

const AddPost = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container>
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">
            Create New Post
          </h1>
          <PostForm />
        </div>
      </Container>
    </div>
  );
};

export default AddPost;
