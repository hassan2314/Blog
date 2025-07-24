# Appwrite Database Setup Guide

This guide will help you set up all the required collections in your Appwrite database for the enhanced MegaBlog features.

## 🗄️ Required Collections

You need to create the following collections in your Appwrite database:

### 1. Posts Collection (Enhanced)
**Collection ID**: Use your existing posts collection or create new one
**Document ID**: Custom (slug-based)

**Attributes:**
```
title          | String   | Required | Size: 255
content        | String   | Required | Size: 65535
featuredimage  | String   | Required | Size: 255
status         | Boolean  | Required | Default: false
userId         | String   | Required | Size: 255
categories     | String   | Array    | Size: 255 (Optional)
tags           | String   | Array    | Size: 255 (Optional)
createdAt      | DateTime | Required | Default: now()
updatedAt      | DateTime | Required | Default: now()
viewCount      | Integer  | Optional | Default: 0
likeCount      | Integer  | Optional | Default: 0
```

**Indexes:**
- `userId_status` (userId ASC, status ASC)
- `createdAt` (createdAt DESC)
- `categories` (categories ASC)
- `tags` (tags ASC)

### 2. Comments Collection
**Collection ID**: `comments` (or set in VITE_APPWRITE_COMMENTS_COLLECTION_ID)
**Document ID**: Auto-generated

**Attributes:**
```
postId         | String   | Required | Size: 255
userId         | String   | Required | Size: 255
content        | String   | Required | Size: 2000
parentId       | String   | Optional | Size: 255
createdAt      | DateTime | Required | Default: now()
updatedAt      | DateTime | Required | Default: now()
isApproved     | Boolean  | Required | Default: true
```

**Indexes:**
- `postId_approved` (postId ASC, isApproved ASC)
- `userId` (userId ASC)
- `createdAt` (createdAt DESC)

### 3. User Profiles Collection
**Collection ID**: `user_profiles` (or set in VITE_APPWRITE_USER_PROFILES_COLLECTION_ID)
**Document ID**: Custom (use userId)

**Attributes:**
```
displayName    | String   | Required | Size: 100
bio            | String   | Optional | Size: 500
avatar         | String   | Optional | Size: 255
socialLinks    | String   | Optional | Size: 1000 (JSON string)
createdAt      | DateTime | Required | Default: now()
updatedAt      | DateTime | Required | Default: now()
```

**Indexes:**
- `displayName` (displayName ASC)

### 4. Categories Collection
**Collection ID**: `categories` (or set in VITE_APPWRITE_CATEGORIES_COLLECTION_ID)
**Document ID**: Custom (slug-based)

**Attributes:**
```
name           | String   | Required | Size: 100
description    | String   | Optional | Size: 500
color          | String   | Required | Size: 7 (hex color)
createdAt      | DateTime | Required | Default: now()
```

**Indexes:**
- `name` (name ASC)

### 5. Tags Collection
**Collection ID**: `tags` (or set in VITE_APPWRITE_TAGS_COLLECTION_ID)
**Document ID**: Custom (slug-based)

**Attributes:**
```
name           | String   | Required | Size: 50
createdAt      | DateTime | Required | Default: now()
```

**Indexes:**
- `name` (name ASC)

### 6. Notifications Collection
**Collection ID**: `notifications` (or set in VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID)
**Document ID**: Auto-generated

**Attributes:**
```
userId         | String   | Required | Size: 255
type           | String   | Required | Size: 50
title          | String   | Required | Size: 255
message        | String   | Required | Size: 500
relatedId      | String   | Optional | Size: 255
isRead         | Boolean  | Required | Default: false
createdAt      | DateTime | Required | Default: now()
```

**Indexes:**
- `userId_read` (userId ASC, isRead ASC)
- `createdAt` (createdAt DESC)

## 🔧 Step-by-Step Setup

### Step 1: Access Appwrite Console
1. Go to your Appwrite console
2. Select your project
3. Navigate to "Databases" in the sidebar
4. Select your database (or create a new one)

### Step 2: Create Collections

For each collection above:

1. **Click "Create Collection"**
2. **Set Collection ID** (use the IDs mentioned above or custom ones)
3. **Set Document Security** to "Document" level
4. **Create Attributes** as specified in the tables above
5. **Create Indexes** for better query performance
6. **Set Permissions** (see permissions section below)

### Step 3: Configure Permissions

For each collection, set the following permissions:

#### Posts Collection
- **Create**: `users` (authenticated users)
- **Read**: `any` (public read)
- **Update**: `users` (document owner only)
- **Delete**: `users` (document owner only)

#### Comments Collection
- **Create**: `users` (authenticated users)
- **Read**: `any` (public read)
- **Update**: `users` (document owner only)
- **Delete**: `users` (document owner only)

#### User Profiles Collection
- **Create**: `users` (authenticated users)
- **Read**: `any` (public read)
- **Update**: `users` (document owner only)
- **Delete**: `users` (document owner only)

#### Categories Collection
- **Create**: `users` (authenticated users)
- **Read**: `any` (public read)
- **Update**: `users` (authenticated users)
- **Delete**: `users` (authenticated users)

#### Tags Collection
- **Create**: `users` (authenticated users)
- **Read**: `any` (public read)
- **Update**: `users` (authenticated users)
- **Delete**: `users` (authenticated users)

#### Notifications Collection
- **Create**: `users` (authenticated users)
- **Read**: `users` (document owner only)
- **Update**: `users` (document owner only)
- **Delete**: `users` (document owner only)

### Step 4: Update Environment Variables

Add the collection IDs to your `.env` file:

```env
# Existing variables
VITE_APPWRITE_URL=your_appwrite_endpoint
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_COLLECTION_ID=your_posts_collection_id
VITE_APPWRITE_BUCKET_ID=your_storage_bucket_id

# New collection IDs
VITE_APPWRITE_COMMENTS_COLLECTION_ID=comments
VITE_APPWRITE_USER_PROFILES_COLLECTION_ID=user_profiles
VITE_APPWRITE_CATEGORIES_COLLECTION_ID=categories
VITE_APPWRITE_TAGS_COLLECTION_ID=tags
VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID=notifications
```

## 🔍 Verification

After setting up all collections, you can verify they're working by:

1. **Starting your application**: `npm run dev`
2. **Creating a new post** - Categories and Tags sections should load without errors
3. **Viewing a post** - Comments section should appear
4. **Checking notifications** - Notification center should be accessible
5. **Viewing profiles** - Profile pages should load

## 🚨 Troubleshooting

### Collection Not Found (404 Error)
- Verify the collection ID in your environment variables
- Check that the collection exists in your Appwrite database
- Ensure the collection ID matches exactly (case-sensitive)

### Permission Denied
- Check collection permissions in Appwrite console
- Ensure user authentication is working
- Verify the user has the correct role/permissions

### Attribute Errors
- Verify all required attributes are created
- Check attribute types match the specification
- Ensure required attributes are marked as required

### Index Issues
- Create indexes for better query performance
- Especially important for `userId`, `postId`, and `createdAt` fields

## 📝 Sample Data

You can add some sample data to test the features:

### Sample Categories
```json
[
  {
    "$id": "technology",
    "name": "Technology",
    "description": "Posts about technology and programming",
    "color": "#3B82F6"
  },
  {
    "$id": "lifestyle",
    "name": "Lifestyle",
    "description": "Posts about lifestyle and personal development",
    "color": "#10B981"
  }
]
```

### Sample Tags
```json
[
  {
    "$id": "react",
    "name": "React"
  },
  {
    "$id": "javascript",
    "name": "JavaScript"
  },
  {
    "$id": "web-development",
    "name": "Web Development"
  }
]
```

## 🔄 Migration from Basic Version

If you're upgrading from the basic MegaBlog version:

1. **Backup your existing data**
2. **Add new attributes to existing Posts collection**:
   - `categories` (String Array, Optional)
   - `tags` (String Array, Optional)
   - `createdAt` (DateTime, Required)
   - `updatedAt` (DateTime, Required)
   - `viewCount` (Integer, Optional, Default: 0)
   - `likeCount` (Integer, Optional, Default: 0)
3. **Create all new collections** as specified above
4. **Update environment variables**
5. **Test all features**

## 📞 Support

If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify collection setup in Appwrite console
3. Check environment variables
4. Ensure proper permissions are set

---

**Once all collections are set up, your enhanced MegaBlog will have full functionality! 🎉**