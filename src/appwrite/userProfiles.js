import conf from "../conf/conf.js";
import { Client, Databases, ID, Query } from "appwrite";

export class UserProfileService {
  client = new Client();
  databases;

  constructor() {
    this.client
      .setEndpoint(conf.appwriteUrl)
      .setProject(conf.appwriteProjectId);
    this.databases = new Databases(this.client);
  }

  // Create user profile
  async createProfile({ userId, displayName, bio, avatar, website, location, socialLinks = {} }) {
    try {
      const profile = await this.databases.createDocument(
        conf.appwriteDatabaseId,
        conf.appwriteUserProfilesCollectionId,
        ID.unique(),
        {
          userId,
          displayName,
          bio: bio || "",
          avatar: avatar || "",
          website: website || "",
          location: location || "",
          socialLinks: JSON.stringify(socialLinks),
          isPublic: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );
      return profile;
    } catch (error) {
      console.error("Create profile error:", error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(userId, { displayName, bio, avatar, website, location, socialLinks, isPublic }) {
    try {
      // First get the existing profile
      const existingProfile = await this.getProfileByUserId(userId);
      if (!existingProfile) {
        throw new Error("Profile not found");
      }

      const updateData = {
        updatedAt: new Date().toISOString()
      };

      if (displayName !== undefined) updateData.displayName = displayName;
      if (bio !== undefined) updateData.bio = bio;
      if (avatar !== undefined) updateData.avatar = avatar;
      if (website !== undefined) updateData.website = website;
      if (location !== undefined) updateData.location = location;
      if (socialLinks !== undefined) updateData.socialLinks = JSON.stringify(socialLinks);
      if (isPublic !== undefined) updateData.isPublic = isPublic;

      const profile = await this.databases.updateDocument(
        conf.appwriteDatabaseId,
        conf.appwriteUserProfilesCollectionId,
        existingProfile.$id,
        updateData
      );
      return profile;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  }

  // Get user profile by user ID
  async getProfileByUserId(userId) {
    try {
      const profiles = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteUserProfilesCollectionId,
        [Query.equal("userId", userId)]
      );
      return profiles.documents.length > 0 ? profiles.documents[0] : null;
    } catch (error) {
      console.error("Get profile by user ID error:", error);
      return null;
    }
  }

  // Get profile by ID
  async getProfile(profileId) {
    try {
      const profile = await this.databases.getDocument(
        conf.appwriteDatabaseId,
        conf.appwriteUserProfilesCollectionId,
        profileId
      );
      return profile;
    } catch (error) {
      console.error("Get profile error:", error);
      return null;
    }
  }

  // Get all public profiles
  async getPublicProfiles(limit = 20) {
    try {
      const profiles = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteUserProfilesCollectionId,
        [
          Query.equal("isPublic", true),
          Query.orderDesc("$createdAt"),
          Query.limit(limit)
        ]
      );
      return profiles;
    } catch (error) {
      console.error("Get public profiles error:", error);
      return { documents: [] };
    }
  }

  // Get or create profile (useful for ensuring profile exists)
  async getOrCreateProfile(userId, userData) {
    try {
      let profile = await this.getProfileByUserId(userId);
      
      if (!profile) {
        // Create profile with basic info from user data
        profile = await this.createProfile({
          userId,
          displayName: userData.name || "",
          bio: "",
          avatar: "",
          website: "",
          location: "",
          socialLinks: {}
        });
      }
      
      return profile;
    } catch (error) {
      console.error("Get or create profile error:", error);
      throw error;
    }
  }

  // Search profiles by display name
  async searchProfiles(searchTerm, limit = 10) {
    try {
      const profiles = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteUserProfilesCollectionId,
        [
          Query.search("displayName", searchTerm),
          Query.equal("isPublic", true),
          Query.limit(limit)
        ]
      );
      return profiles;
    } catch (error) {
      console.error("Search profiles error:", error);
      return { documents: [] };
    }
  }

  // Delete profile
  async deleteProfile(userId) {
    try {
      const profile = await this.getProfileByUserId(userId);
      if (profile) {
        await this.databases.deleteDocument(
          conf.appwriteDatabaseId,
          conf.appwriteUserProfilesCollectionId,
          profile.$id
        );
      }
      return true;
    } catch (error) {
      console.error("Delete profile error:", error);
      throw error;
    }
  }

  // Parse social links from JSON string
  parseSocialLinks(socialLinksJson) {
    try {
      return socialLinksJson ? JSON.parse(socialLinksJson) : {};
    } catch (error) {
      console.error("Parse social links error:", error);
      return {};
    }
  }
}

const userProfileService = new UserProfileService();
export default userProfileService;