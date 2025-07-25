import conf from "../conf/conf.js";
import { Client, Databases, ID, Query } from "appwrite";

export class TagService {
  client = new Client();
  databases;

  constructor() {
    this.client
      .setEndpoint(conf.appwriteUrl)
      .setProject(conf.appwriteProjectId);
    this.databases = new Databases(this.client);
  }

  // Create a new tag (Editor can create)
  async createTag({ name, color = "#10b981", createdBy }) {
    try {
      const tag = await this.databases.createDocument(
        conf.appwriteDatabaseId,
        conf.appwriteTagsCollectionId,
        ID.unique(),
        {
          name,
          slug: this.slugify(name),
          color,
          createdBy,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );
      return tag;
    } catch (error) {
      console.error("Create tag error:", error);
      throw error;
    }
  }

  // Update tag
  async updateTag(tagId, { name, color, isActive }) {
    try {
      const updateData = {
        updatedAt: new Date().toISOString()
      };
      
      if (name !== undefined) {
        updateData.name = name;
        updateData.slug = this.slugify(name);
      }
      if (color !== undefined) updateData.color = color;
      if (isActive !== undefined) updateData.isActive = isActive;

      const tag = await this.databases.updateDocument(
        conf.appwriteDatabaseId,
        conf.appwriteTagsCollectionId,
        tagId,
        updateData
      );
      return tag;
    } catch (error) {
      console.error("Update tag error:", error);
      throw error;
    }
  }

  // Delete tag
  async deleteTag(tagId) {
    try {
      await this.databases.deleteDocument(
        conf.appwriteDatabaseId,
        conf.appwriteTagsCollectionId,
        tagId
      );
      return true;
    } catch (error) {
      console.error("Delete tag error:", error);
      throw error;
    }
  }

  // Get all tags
  async getTags(onlyActive = true) {
    try {
      const queries = onlyActive ? [Query.equal("isActive", true)] : [];
      const tags = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteTagsCollectionId,
        [Query.orderDesc("$createdAt"), ...queries]
      );
      return tags;
    } catch (error) {
      console.error("Get tags error:", error);
      return { documents: [] };
    }
  }

  // Get tag by ID
  async getTag(tagId) {
    try {
      const tag = await this.databases.getDocument(
        conf.appwriteDatabaseId,
        conf.appwriteTagsCollectionId,
        tagId
      );
      return tag;
    } catch (error) {
      console.error("Get tag error:", error);
      return null;
    }
  }

  // Get tag by slug
  async getTagBySlug(slug) {
    try {
      const tags = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteTagsCollectionId,
        [Query.equal("slug", slug), Query.equal("isActive", true)]
      );
      return tags.documents.length > 0 ? tags.documents[0] : null;
    } catch (error) {
      console.error("Get tag by slug error:", error);
      return null;
    }
  }

  // Search tags by name (for autocomplete)
  async searchTags(searchTerm, limit = 10) {
    try {
      const tags = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteTagsCollectionId,
        [
          Query.search("name", searchTerm),
          Query.equal("isActive", true),
          Query.limit(limit)
        ]
      );
      return tags;
    } catch (error) {
      console.error("Search tags error:", error);
      return { documents: [] };
    }
  }

  // Get or create tag (useful for creating tags on the fly)
  async getOrCreateTag(name, createdBy, color = "#10b981") {
    try {
      // First try to find existing tag
      const slug = this.slugify(name);
      const existingTags = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteTagsCollectionId,
        [Query.equal("slug", slug)]
      );

      if (existingTags.documents.length > 0) {
        return existingTags.documents[0];
      }

      // Create new tag if not found
      return await this.createTag({ name, color, createdBy });
    } catch (error) {
      console.error("Get or create tag error:", error);
      throw error;
    }
  }

  // Helper function to create URL-friendly slugs
  slugify(text) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }
}

const tagService = new TagService();
export default tagService;