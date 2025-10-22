import conf from "../conf/conf.js";
import { Client, Databases, ID, Query } from "appwrite";

export class RoleService {
  client = new Client();
  databases;

  constructor() {
    this.client
      .setEndpoint(conf.appwriteUrl)
      .setProject(conf.appwriteProjectId);
    this.databases = new Databases(this.client);
  }

  // Role definitions with permissions
  static ROLES = {
    SUPER_ADMIN: {
      name: 'super_admin',
      displayName: 'Super Admin',
      permissions: [
        'user.create', 'user.read', 'user.update', 'user.delete',
        'post.create', 'post.read', 'post.update', 'post.delete',
        'role.create', 'role.read', 'role.update', 'role.delete',
        'category.create', 'category.read', 'category.update', 'category.delete',
        'tag.create', 'tag.read', 'tag.update', 'tag.delete',
        'profile.read', 'profile.update', 'profile.delete',
        'admin.access', 'analytics.view', 'settings.manage'
      ]
    },
    ADMIN: {
      name: 'admin',
      displayName: 'Admin',
      permissions: [
        'user.read', 'user.update',
        'post.create', 'post.read', 'post.update', 'post.delete',
        'category.create', 'category.read', 'category.update', 'category.delete',
        'tag.read', 'tag.update', 'tag.delete',
        'profile.read', 'profile.update',
        'admin.access', 'analytics.view'
      ]
    },
    MODERATOR: {
      name: 'moderator',
      displayName: 'Moderator',
      permissions: [
        'post.read', 'post.update', 'post.delete',
        'category.read', 'tag.read', 'tag.update',
        'user.read', 'profile.read',
        'admin.access'
      ]
    },
    EDITOR: {
      name: 'editor',
      displayName: 'Editor',
      permissions: [
        'post.create', 'post.read', 'post.update',
        'category.read', 'tag.create', 'tag.read', 'tag.update',
        'profile.read', 'profile.update',
        'admin.access'
      ]
    },
    USER: {
      name: 'user',
      displayName: 'User',
      permissions: ['post.read', 'profile.read', 'profile.update']
    }
  };

  // Get user role from database or default to 'user'
  async getUserRole(userId) {
    try {
      const userRoles = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteUserRolesCollectionId,
        [Query.equal("userId", userId)]
      );

      if (userRoles.documents.length > 0) {
        const roleDoc = userRoles.documents[0];
        const role = RoleService.ROLES[roleDoc.role.toUpperCase()];
        return {
          role: role?.name || 'user',
          permissions: role?.permissions || ['post.read']
        };
      }

      return {
        role: 'user',
        permissions: ['post.read']
      };
    } catch (error) {
      console.error("Error fetching user role:", error);
      return {
        role: 'user',
        permissions: ['post.read']
      };
    }
  }

  // Update user role
  async updateUserRole(userId, roleName) {
    try {
      const role = RoleService.ROLES[roleName.toUpperCase()];
      if (!role) {
        throw new Error("Invalid role name");
      }

      // Check if user role document exists
      const existingRoles = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteUserRolesCollectionId,
        [Query.equal("userId", userId)]
      );

      if (existingRoles.documents.length > 0) {
        // Update existing role
        await this.databases.updateDocument(
          conf.appwriteDatabaseId,
          conf.appwriteUserRolesCollectionId,
          existingRoles.documents[0].$id,
          {
            role: role.name,
            updatedAt: new Date().toISOString()
          }
        );
      } else {
        // Create new role document
        await this.databases.createDocument(
          conf.appwriteDatabaseId,
          conf.appwriteUserRolesCollectionId,
          ID.unique(),
          {
            userId: userId,
            role: role.name,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        );
      }

      return {
        role: role.name,
        permissions: role.permissions
      };
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error;
    }
  }

  // Get all users with their roles
  async getAllUsersWithRoles() {
    try {
      const userRoles = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteUserRolesCollectionId
      );

      return userRoles.documents.map(doc => ({
        userId: doc.userId,
        role: doc.role,
        roleDisplay: RoleService.ROLES[doc.role.toUpperCase()]?.displayName || 'User',
        permissions: RoleService.ROLES[doc.role.toUpperCase()]?.permissions || ['post.read'],
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
      }));
    } catch (error) {
      console.error("Error fetching all user roles:", error);
      return [];
    }
  }

  // Check if user has specific permission
  hasPermission(userPermissions, requiredPermission) {
    return userPermissions.includes(requiredPermission);
  }

  // Check if user has any of the required permissions
  hasAnyPermission(userPermissions, requiredPermissions) {
    return requiredPermissions.some(permission => 
      userPermissions.includes(permission)
    );
  }

  // Get all available roles
  getAllRoles() {
    return Object.values(RoleService.ROLES);
  }
}

const roleService = new RoleService();
export default roleService;