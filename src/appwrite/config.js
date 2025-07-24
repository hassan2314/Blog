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

  async createPost({ title, slug, content, featuredimage, status, userId, categories = [], tags = [] }) {
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
          categories: categories,
          tags: tags,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          viewCount: 0,
          likeCount: 0,
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

  async updatePost(slug, { title, content, featuredImage, status, categories = [], tags = [] }) {
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
          categories,
          tags,
          updatedAt: new Date().toISOString(),
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

  // Comments functionality
  async createComment({ postId, userId, content, parentId = null }) {
    try {
      const comment = await this.databases.createDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCommentsCollectionId,
        ID.unique(),
        {
          postId,
          userId,
          content,
          parentId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isApproved: true,
        }
      );
      return comment;
    } catch (error) {
      console.log("Create comment error", error);
      return null;
    }
  }

  async getComments(postId) {
    try {
      const comments = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteCommentsCollectionId,
        [
          Query.equal("postId", postId),
          Query.equal("isApproved", true),
          Query.orderDesc("createdAt")
        ]
      );
      return comments;
    } catch (error) {
      console.log("Get comments error", error);
      return null;
    }
  }

  async deleteComment(commentId) {
    try {
      await this.databases.deleteDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCommentsCollectionId,
        commentId
      );
      return true;
    } catch (error) {
      console.log("Delete comment error", error);
      return false;
    }
  }

  // User profiles functionality
  async createUserProfile({ userId, displayName, bio, avatar, socialLinks = {} }) {
    try {
      const profile = await this.databases.createDocument(
        conf.appwriteDatabaseId,
        conf.appwriteUserProfilesCollectionId,
        userId,
        {
          displayName,
          bio,
          avatar,
          socialLinks: JSON.stringify(socialLinks),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      return profile;
    } catch (error) {
      console.log("Create user profile error", error);
      return null;
    }
  }

  async getUserProfile(userId) {
    try {
      const profile = await this.databases.getDocument(
        conf.appwriteDatabaseId,
        conf.appwriteUserProfilesCollectionId,
        userId
      );
      return profile;
    } catch (error) {
      console.log("Get user profile error", error);
      return null;
    }
  }

  async updateUserProfile(userId, { displayName, bio, avatar, socialLinks }) {
    try {
      return await this.databases.updateDocument(
        conf.appwriteDatabaseId,
        conf.appwriteUserProfilesCollectionId,
        userId,
        {
          displayName,
          bio,
          avatar,
          socialLinks: JSON.stringify(socialLinks),
          updatedAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.log("Update user profile error", error);
      return null;
    }
  }

  // Categories functionality
  async createCategory({ name, slug, description, color }) {
    try {
      const category = await this.databases.createDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCategoriesCollectionId,
        slug,
        {
          name,
          description,
          color,
          createdAt: new Date().toISOString(),
        }
      );
      return category;
    } catch (error) {
      console.log("Create category error", error);
      return null;
    }
  }

  async getCategories() {
    try {
      const categories = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteCategoriesCollectionId,
        [Query.orderAsc("name")]
      );
      return categories;
    } catch (error) {
      console.log("Get categories error", error);
      return null;
    }
  }

  // Tags functionality
  async createTag({ name, slug }) {
    try {
      const tag = await this.databases.createDocument(
        conf.appwriteDatabaseId,
        conf.appwriteTagsCollectionId,
        slug,
        {
          name,
          createdAt: new Date().toISOString(),
        }
      );
      return tag;
    } catch (error) {
      console.log("Create tag error", error);
      return null;
    }
  }

  async getTags() {
    try {
      const tags = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteTagsCollectionId,
        [Query.orderAsc("name")]
      );
      return tags;
    } catch (error) {
      console.log("Get tags error", error);
      return null;
    }
  }

  // Search functionality
  async searchPosts(searchTerm) {
    try {
      const posts = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        [
          Query.equal("status", true),
          Query.search("title", searchTerm)
        ]
      );
      return posts;
    } catch (error) {
      console.log("Search posts error", error);
      return null;
    }
  }

  async getPostsByCategory(categoryId) {
    try {
      const posts = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        [
          Query.equal("status", true),
          Query.contains("categories", categoryId),
          Query.orderDesc("createdAt")
        ]
      );
      return posts;
    } catch (error) {
      console.log("Get posts by category error", error);
      return null;
    }
  }

  async getPostsByTag(tagId) {
    try {
      const posts = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        [
          Query.equal("status", true),
          Query.contains("tags", tagId),
          Query.orderDesc("createdAt")
        ]
      );
      return posts;
    } catch (error) {
      console.log("Get posts by tag error", error);
      return null;
    }
  }

  // Notifications functionality
  async createNotification({ userId, type, title, message, relatedId }) {
    try {
      const notification = await this.databases.createDocument(
        conf.appwriteDatabaseId,
        conf.appwriteNotificationsCollectionId,
        ID.unique(),
        {
          userId,
          type,
          title,
          message,
          relatedId,
          isRead: false,
          createdAt: new Date().toISOString(),
        }
      );
      return notification;
    } catch (error) {
      console.log("Create notification error", error);
      return null;
    }
  }

  async getUserNotifications(userId) {
    try {
      const notifications = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteNotificationsCollectionId,
        [
          Query.equal("userId", userId),
          Query.orderDesc("createdAt"),
          Query.limit(50)
        ]
      );
      return notifications;
    } catch (error) {
      console.log("Get user notifications error", error);
      return null;
    }
  }

  async markNotificationAsRead(notificationId) {
    try {
      return await this.databases.updateDocument(
        conf.appwriteDatabaseId,
        conf.appwriteNotificationsCollectionId,
        notificationId,
        {
          isRead: true,
        }
      );
    } catch (error) {
      console.log("Mark notification as read error", error);
      return null;
    }
  }

  // Post interactions
  async incrementViewCount(slug) {
    try {
      const post = await this.getPost(slug);
      if (post) {
        return await this.databases.updateDocument(
          conf.appwriteDatabaseId,
          conf.appwriteCollectionId,
          slug,
          {
            viewCount: (post.viewCount || 0) + 1,
          }
        );
      }
    } catch (error) {
      console.log("Increment view count error", error);
    }
    return null;
  }
}

const services = new Services();
export default services;
