# Database Setup Guide

This guide will help you set up the required Appwrite database collections for the enhanced blog application with user profiles, categories, and tags.

## Required Collections

You need to create the following collections in your Appwrite database:

### 1. Categories Collection

**Collection ID**: `categories`

**Attributes**:
- `name` (String, required, 255 chars) - Category name
- `description` (String, optional, 1000 chars) - Category description
- `slug` (String, required, 255 chars, unique) - URL-friendly identifier
- `color` (String, required, 7 chars) - Hex color code for the category
- `isActive` (Boolean, required, default: true) - Whether category is active
- `createdAt` (DateTime, required) - Creation timestamp
- `updatedAt` (DateTime, required) - Last update timestamp

**Indexes**:
- `slug` (key: slug, type: key, unique)
- `isActive` (key: isActive, type: key)

**Permissions**:
- Read: `role:admin`, `role:editor`, `role:moderator`, `role:user`
- Create: `role:admin`
- Update: `role:admin`
- Delete: `role:admin`

### 2. Tags Collection

**Collection ID**: `tags`

**Attributes**:
- `name` (String, required, 100 chars) - Tag name
- `slug` (String, required, 100 chars, unique) - URL-friendly identifier
- `color` (String, required, 7 chars) - Hex color code for the tag
- `createdBy` (String, required, 36 chars) - User ID who created the tag
- `isActive` (Boolean, required, default: true) - Whether tag is active
- `createdAt` (DateTime, required) - Creation timestamp
- `updatedAt` (DateTime, required) - Last update timestamp

**Indexes**:
- `slug` (key: slug, type: key, unique)
- `createdBy` (key: createdBy, type: key)
- `isActive` (key: isActive, type: key)
- `name` (key: name, type: fulltext) - For search functionality

**Permissions**:
- Read: `role:admin`, `role:editor`, `role:moderator`, `role:user`
- Create: `role:admin`, `role:editor`
- Update: `role:admin`, `role:editor`, `role:moderator`
- Delete: `role:admin`, `role:editor`

### 3. User Profiles Collection

**Collection ID**: `user_profiles`

**Attributes**:
- `userId` (String, required, 36 chars, unique) - Appwrite user ID
- `displayName` (String, optional, 255 chars) - Display name
- `bio` (String, optional, 1000 chars) - User biography
- `avatar` (String, optional, 255 chars) - Avatar image URL or file ID
- `website` (String, optional, 255 chars) - Personal website URL
- `location` (String, optional, 255 chars) - User location
- `socialLinks` (String, optional, 2000 chars) - JSON string of social media links
- `isPublic` (Boolean, required, default: true) - Whether profile is public
- `createdAt` (DateTime, required) - Creation timestamp
- `updatedAt` (DateTime, required) - Last update timestamp

**Indexes**:
- `userId` (key: userId, type: key, unique)
- `isPublic` (key: isPublic, type: key)
- `displayName` (key: displayName, type: fulltext) - For search functionality

**Permissions**:
- Read: `role:admin`, `role:editor`, `role:moderator`, `role:user`
- Create: `users`
- Update: `users` (own documents only), `role:admin`
- Delete: `users` (own documents only), `role:admin`

### 4. Update Existing Posts Collection

You need to add the following attributes to your existing posts collection:

**New Attributes**:
- `categoryId` (String, optional, 36 chars) - Reference to category ID
- `tags` (String, optional, 5000 chars) - JSON string of associated tags

**New Indexes**:
- `categoryId` (key: categoryId, type: key)

## Environment Variables

Add these to your `.env` file:

```env
VITE_APPWRITE_CATEGORIES_COLLECTION_ID=categories
VITE_APPWRITE_TAGS_COLLECTION_ID=tags
VITE_APPWRITE_USER_PROFILES_COLLECTION_ID=user_profiles
```

## Setting Up Collections via Appwrite Console

1. **Go to your Appwrite Console**
2. **Navigate to Databases**
3. **Select your database**
4. **Create each collection** with the specifications above

### Step-by-step for Categories Collection:

1. Click "Create Collection"
2. Set Collection ID: `categories`
3. Add attributes one by one:
   - Click "Create Attribute" → "String"
   - Name: `name`, Size: 255, Required: Yes
   - Repeat for all attributes
4. Create indexes as specified
5. Set permissions as specified

Repeat similar steps for Tags and User Profiles collections.

## Sample Data

### Sample Categories:
```json
[
  {
    "name": "Technology",
    "description": "Posts about technology and programming",
    "slug": "technology",
    "color": "#3B82F6",
    "isActive": true
  },
  {
    "name": "Lifestyle",
    "description": "Posts about lifestyle and personal experiences",
    "slug": "lifestyle", 
    "color": "#10B981",
    "isActive": true
  }
]
```

### Sample Tags:
```json
[
  {
    "name": "JavaScript",
    "slug": "javascript",
    "color": "#F59E0B",
    "isActive": true
  },
  {
    "name": "React",
    "slug": "react",
    "color": "#06B6D4",
    "isActive": true
  }
]
```

## Verification

After setting up the collections, verify that:

1. All collections are created with correct IDs
2. All attributes are added with correct types and constraints
3. Indexes are created for performance
4. Permissions are set correctly for your role system
5. Environment variables are configured

## Troubleshooting

**Common Issues**:

1. **Permission Errors**: Make sure your role-based permissions are set correctly
2. **Collection Not Found**: Verify collection IDs match your environment variables
3. **Attribute Errors**: Check that all required attributes are created with correct types
4. **Index Errors**: Ensure unique indexes are set for slug fields

**Testing**:

1. Try creating a category through the admin panel
2. Test tag creation when writing a post
3. Check profile creation when visiting the profile page
4. Verify permissions work correctly for different user roles

## Next Steps

After setting up the database:

1. **Create an admin user** and assign admin role
2. **Create some initial categories** through the admin panel
3. **Test the post creation** with categories and tags
4. **Set up user profiles** for your team members
5. **Configure role permissions** as needed for your use case