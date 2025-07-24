const conf = {
  appwriteUrl: String(import.meta.env.VITE_APPWRITE_URL),
  appwriteProjectId: String(import.meta.env.VITE_APPWRITE_PROJECT_ID),
  appwriteDatabaseId: String(import.meta.env.VITE_APPWRITE_DATABASE_ID),
  appwriteCollectionId: String(import.meta.env.VITE_APPWRITE_COLLECTION_ID),
  appwriteBucketId: String(import.meta.env.VITE_APPWRITE_BUCKET_ID),
  // New collections for enhanced features
  appwriteCommentsCollectionId: String(import.meta.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID || 'comments'),
  appwriteUserProfilesCollectionId: String(import.meta.env.VITE_APPWRITE_USER_PROFILES_COLLECTION_ID || 'user_profiles'),
  appwriteCategoriesCollectionId: String(import.meta.env.VITE_APPWRITE_CATEGORIES_COLLECTION_ID || 'categories'),
  appwriteTagsCollectionId: String(import.meta.env.VITE_APPWRITE_TAGS_COLLECTION_ID || 'tags'),
  appwriteNotificationsCollectionId: String(import.meta.env.VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID || 'notifications'),
};

export default conf;
