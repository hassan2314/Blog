import conf from "../conf/conf.js";
import { Client, Databases, Storage, ID, Query } from "appwrite";

export class Services {
  client = new Client();
  databases;
  storage;

  constructor() {
    this.client
      .setEndpoint(conf.appwriteUrl)
      .setProject(conf.appwriteProjectId);

    this.databases = new Databases(this.client);
    this.storage = new Storage(this.client);
  }

  async createPost({ title, slug, content, featuredimage, status, userId }) {
    try {
      const post = await this.databases.createDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        slug,
        {
          title,
          content,
          featuredimage,
          status,
          userId,
        }
      );
      if (post) {
        return post;
      }
    } catch (error) {
      console.log("Create post error", error);
    }
    return null;
  }

  async updatePost(slug, { title, content, featuredImage, status }) {
    try {
      return await this.databases.updateDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        slug,
        {
          title,
          content,
          featuredImage,
          status,
        }
      );
    } catch (error) {
      console.log("Update post error", error);
    }
  }

  async deletePost(slug) {
    try {
      await this.databases.deleteDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        slug
      );
      return true;
    } catch (error) {
      console.log("Delete post error", error);
      return false;
    }
  }

  async getPost(slug) {
    try {
      const post = await this.databases.getDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        slug
      );
      return post;
    } catch (error) {
      console.log("Get post error", error);
    }
    return null;
  }

  async getPosts(queries = [Query.equal("status", true)]) {
    try {
      const posts = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        queries
      );
      return posts;
    } catch (error) {
      console.log("Get posts error", error);
    }
    return null;
  }

  async uploadImage(file) {
    try {
      const image = await this.storage.createFile(
        conf.appwriteBucketId,
        ID.unique(),
        file
      );
      return image;
    } catch (error) {
      console.log("Upload image error", error);
    }
    return null;
  }

  async deleteImage(imageId) {
    try {
      await this.storage.deleteFile(conf.appwriteBucketId, imageId);
      return true;
    } catch (error) {
      console.log("Delete image error", error);
      return false;
    }
  }

  getImagePreview(imageId) {
    return this.storage.getFileView(conf.appwriteBucketId, imageId);
  }
}

const services = new Services();
export default services;
