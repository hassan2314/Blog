import React, { useEffect, useState } from "react";
import { Container, PostCard } from "../components";
import appwriteService from "../appwrite/config.js";

const Home = () => {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    console.log("useEffect");
    appwriteService.getPosts().then((Posts) => {
      if (Posts) {
        setPosts(Posts.documents);
        console.log("Fetched posts:", Posts.documents.length);
      } else {
        setPosts([]);
        console.log("No posts found.");
      }
    });
  }, []);

  if (posts.length > 0) {
    return (
      <div className=" w-full py-8">
        <Container>
          <div className=" flex flex-wrap">
            {posts.map((post) => (
              <div className="p-2 w-1/4" key={post.$id}>
                <PostCard post={post} />
              </div>
            ))}
          </div>
        </Container>
      </div>
    );
  } else {
    return (
      <div className=" w-full py-8">
        <Container>
          <div className=" flex flex-wrap">
            <h1>No posts found</h1>
          </div>
        </Container>
      </div>
    );
  }
};

export default Home;
