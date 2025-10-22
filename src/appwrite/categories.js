import conf from "../conf/conf.js";
import { Client, Databases, ID, Query } from "appwrite";

export class CategoryService {
  client = new Client();
  databases;

  constructor() {
    this.client
      .setEndpoint(conf.appwriteUrl)
      .setProject(conf.appwriteProjectId);
    this.databases = new Databases(this.client);
  }

  // Create a new category (Admin only)
  async createCategory({ name, description, slug, color = "#6366f1" }) {
    try {
      const category = await this.databases.createDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCategoriesCollectionId,
        ID.unique(),
        {
          name,
          description,
          slug: slug || this.slugify(name),
          color,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );
      return category;
    } catch (error) {
      console.error("Create category error:", error);
      throw error;
    }
  }

  // Update category (Admin only)
  async updateCategory(categoryId, { name, description, slug, color, isActive }) {
    try {
      const updateData = {
        updatedAt: new Date().toISOString()
      };
      
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (slug !== undefined) updateData.slug = slug;
      if (color !== undefined) updateData.color = color;
      if (isActive !== undefined) updateData.isActive = isActive;

      const category = await this.databases.updateDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCategoriesCollectionId,
        categoryId,
        updateData
      );
      return category;
    } catch (error) {
      console.error("Update category error:", error);
      throw error;
    }
  }

  // Delete category (Admin only)
  async deleteCategory(categoryId) {
    try {
      await this.databases.deleteDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCategoriesCollectionId,
        categoryId
      );
      return true;
    } catch (error) {
      console.error("Delete category error:", error);
      throw error;
    }
  }

  // Get all categories
  async getCategories(onlyActive = true) {
    try {
      const queries = onlyActive ? [Query.equal("isActive", true)] : [];
      const categories = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteCategoriesCollectionId,
        [Query.orderDesc("$createdAt"), ...queries]
      );
      return categories;
    } catch (error) {
      console.error("Get categories error:", error);
      return { documents: [] };
    }
  }

  // Get category by ID
  async getCategory(categoryId) {
    try {
      const category = await this.databases.getDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCategoriesCollectionId,
        categoryId
      );
      return category;
    } catch (error) {
      console.error("Get category error:", error);
      return null;
    }
  }

  // Get category by slug
  async getCategoryBySlug(slug) {
    try {
      const categories = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteCategoriesCollectionId,
        [Query.equal("slug", slug), Query.equal("isActive", true)]
      );
      return categories.documents.length > 0 ? categories.documents[0] : null;
    } catch (error) {
      console.error("Get category by slug error:", error);
      return null;
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

const categoryService = new CategoryService();
export default categoryService;