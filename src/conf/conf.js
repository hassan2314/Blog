const conf = {
  appwriteUrl: String(import.meta.env.VITE_APPWRITE_URL),
  appwriteProjectId: String(import.meta.env.VITE_APPWRITE_PROJECT_ID),
  appwriteDatabaseId: String(import.meta.env.VITE_APPWRITE_DATABASE_ID),
  appwriteCollectionId: String(import.meta.env.VITE_APPWRITE_COLLECTION_ID),
  appwriteUserRolesCollectionId: String(import.meta.env.VITE_APPWRITE_USER_ROLES_COLLECTION_ID || "user_roles"),
  appwriteCategoriesCollectionId: String(import.meta.env.VITE_APPWRITE_CATEGORIES_COLLECTION_ID || "categories"),
  appwriteTagsCollectionId: String(import.meta.env.VITE_APPWRITE_TAGS_COLLECTION_ID || "tags"),
  appwriteUserProfilesCollectionId: String(import.meta.env.VITE_APPWRITE_USER_PROFILES_COLLECTION_ID || "user_profiles"),
  appwriteBucketId: String(import.meta.env.VITE_APPWRITE_BUCKET_ID),
};

export default conf;
