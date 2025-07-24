import conf from "../conf/conf.js";
import { Client, Account, ID } from "appwrite";

export class AuthService {
  client = new Client();
  account;
  constructor() {
    this.client
      .setEndpoint(conf.appwriteUrl)
      .setProject(conf.appwriteProjectId);
    this.account = new Account(this.client);
  }

  async create({ email, password, name }) {
    try {
      const userAccount = await this.account.create(
        ID.unique(),
        email,
        password,
        name
      );

      if (userAccount) {
        return this.login({ email, password });
      } else {
        return null;
      }
    } catch (error) {
      throw error;
    }
  }

  async login({ email, password }) {
    try {
      const userAccount = await this.account.createEmailPasswordSession(
        email,
        password
      );
      return userAccount;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      await this.account.deleteSessions();
    } catch (error) {
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const userAccount = await this.account.get();
      return userAccount;
    } catch (error) {
      console.log("Get current user error", error);
    }
    return null;
  }

  async getCurrentUserWithRole() {
    try {
      const userAccount = await this.account.get();
      if (userAccount) {
        // Import roleService dynamically to avoid circular dependency
        const { default: roleService } = await import('./roles.js');
        const roleData = await roleService.getUserRole(userAccount.$id);
        
        return {
          userData: userAccount,
          userRole: roleData.role,
          permissions: roleData.permissions
        };
      }
      return null;
    } catch (error) {
      console.log("Get current user with role error", error);
      return null;
    }
  }
}

const authService = new AuthService();
export default authService;
