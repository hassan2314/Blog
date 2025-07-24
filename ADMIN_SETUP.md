# Admin Panel Setup Guide

This guide will help you set up and use the advanced admin panel with user roles and permissions system.

## Features

### 🛡️ Advanced Role System
- **Super Admin**: Full system access with all permissions
- **Admin**: User and content management with analytics access
- **Moderator**: Content moderation and user viewing permissions
- **Editor**: Content creation and editing capabilities
- **User**: Basic read-only access

### 🔐 Permission-Based Access Control
- **User Management**: Create, read, update, delete users
- **Content Management**: Manage posts and content
- **Role Management**: Configure roles and permissions
- **Analytics**: View system analytics and reports
- **Settings**: System configuration management

### 📊 Admin Dashboard
- Overview cards with statistics
- Permission-based navigation
- Recent activity tracking
- Role and permission management

## Setup Instructions

### 1. Environment Variables

Add the following to your `.env` file:

```env
VITE_APPWRITE_USER_ROLES_COLLECTION_ID=user_roles
```

### 2. Appwrite Database Setup

Create a new collection in your Appwrite database:

**Collection Name**: `user_roles`
**Collection ID**: `user_roles`

**Attributes**:
- `userId` (String, 255 characters, Required)
- `role` (String, 50 characters, Required, Default: "user")
- `createdAt` (String, 255 characters)
- `updatedAt` (String, 255 characters)

**Permissions**:
- Read: `users`
- Write: `users`
- Update: `users`
- Delete: `users`

### 3. Create Your First Admin User

1. Register a new user account through the normal signup process
2. Open browser developer console
3. Run the following code to make yourself a super admin:

```javascript
// Import the setup utility (in browser console after page load)
import { setupInitialAdmin } from './src/utils/setupAdmin.js';

// Replace 'YOUR_USER_ID' with your actual user ID
// You can find this in the Redux store or network requests
await setupInitialAdmin('YOUR_USER_ID');

// Refresh the page to see admin panel access
window.location.reload();
```

### 4. Alternative Setup (Through Code)

You can also set up admin access programmatically in your app:

```javascript
import roleService from './src/appwrite/roles.js';
import { useSelector } from 'react-redux';

// In a React component
const { userData } = useSelector(state => state.auth);

const makeUserAdmin = async () => {
  if (userData?.$id) {
    try {
      await roleService.updateUserRole(userData.$id, 'super_admin');
      // Refresh the page or update Redux state
      window.location.reload();
    } catch (error) {
      console.error('Error setting up admin:', error);
    }
  }
};
```

## Using the Admin Panel

### Accessing the Admin Panel

1. Log in with an account that has admin permissions
2. Click the "Admin Panel" link in the header navigation
3. You'll see the admin dashboard with available modules

### User Management

- **View Users**: See all users with their roles and permissions
- **Assign Roles**: Change user roles with real-time permission updates
- **Filter Users**: Search and filter by role or name
- **User Actions**: Edit or delete users (permission-dependent)

### Role Management

- **View Roles**: See all available roles and their permissions
- **Permission Overview**: Understand what each role can do
- **Role Statistics**: See permission distribution across roles

### Permission System

The system uses a granular permission model:

- `user.create` - Create new users
- `user.read` - View user information
- `user.update` - Modify user data and roles
- `user.delete` - Delete users
- `post.create` - Create new posts
- `post.read` - View posts
- `post.update` - Edit posts
- `post.delete` - Delete posts
- `role.create` - Create new roles
- `role.read` - View roles and permissions
- `role.update` - Modify roles
- `role.delete` - Delete roles
- `admin.access` - Access admin panel
- `analytics.view` - View analytics
- `settings.manage` - Manage system settings

## Security Considerations

### Permission Guards

All admin routes and components are protected with permission guards:

```jsx
<PermissionGuard requiredPermission="admin.access">
  <AdminDashboard />
</PermissionGuard>
```

### Role Validation

- Roles are validated server-side through Appwrite
- Permissions are checked before displaying UI elements
- API calls include permission verification

### Best Practices

1. **Principle of Least Privilege**: Give users only the permissions they need
2. **Regular Audits**: Review user roles and permissions regularly
3. **Role Separation**: Keep different responsibilities in separate roles
4. **Secure Defaults**: New users get minimal permissions by default

## Customization

### Adding New Roles

1. Edit `src/appwrite/roles.js`
2. Add new role to the `ROLES` object:

```javascript
NEW_ROLE: {
  name: 'new_role',
  displayName: 'New Role',
  permissions: ['permission1', 'permission2']
}
```

### Adding New Permissions

1. Define the permission in the roles service
2. Add permission checks in components:

```javascript
const canDoSomething = roleService.hasPermission(permissions, 'new.permission');
```

3. Protect routes with PermissionGuard:

```jsx
<PermissionGuard requiredPermission="new.permission">
  <NewComponent />
</PermissionGuard>
```

## Troubleshooting

### Common Issues

1. **Admin Panel Not Visible**: Check if user has `admin.access` permission
2. **Permission Denied**: Verify user role has required permissions
3. **Role Not Updating**: Refresh page after role changes
4. **Database Errors**: Ensure Appwrite collection is properly configured

### Debug Commands

```javascript
// Check current user permissions
console.log(store.getState().auth.permissions);

// Check user role
console.log(store.getState().auth.userRole);

// Test permission
import roleService from './src/appwrite/roles.js';
console.log(roleService.hasPermission(permissions, 'admin.access'));
```

## Support

For issues or questions about the admin panel:

1. Check the browser console for errors
2. Verify Appwrite database configuration
3. Ensure environment variables are set correctly
4. Test with a fresh user account

The admin panel provides a comprehensive role-based access control system that can be customized to fit your application's needs.