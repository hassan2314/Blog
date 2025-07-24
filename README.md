# MegaBlog - Enhanced Blog Platform

A modern, feature-rich blog platform built with React, Vite, and Appwrite. This enhanced version includes advanced features like comments, user profiles, search, categories, tags, social sharing, and notifications.

## 🚀 Features

### Core Features
- ✅ User authentication (signup/login)
- ✅ Create, edit, and delete blog posts
- ✅ Rich text editor for post content
- ✅ Image upload for featured images
- ✅ Responsive design with Tailwind CSS

### Enhanced Features (New!)
- 🆕 **Comment System** - Threaded comments with replies
- 🆕 **User Profiles** - Customizable user profiles with social links
- 🆕 **Categories & Tags** - Organize posts with categories and tags
- 🆕 **Advanced Search** - Full-text search with filters
- 🆕 **Social Media Sharing** - Share posts on various platforms
- 🆕 **Email Notifications** - In-app and email notifications
- 🆕 **Post Analytics** - View counts and engagement metrics

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS
- **Backend**: Appwrite (BaaS)
- **State Management**: Redux Toolkit
- **Form Handling**: React Hook Form
- **Rich Text Editor**: TinyMCE
- **Icons**: React Icons (Feather Icons)
- **Date Handling**: date-fns
- **Search**: Fuse.js (fuzzy search)
- **Social Sharing**: react-share
- **Notifications**: react-hot-toast

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd megablog
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_APPWRITE_URL=your_appwrite_endpoint
   VITE_APPWRITE_PROJECT_ID=your_project_id
   VITE_APPWRITE_DATABASE_ID=your_database_id
   VITE_APPWRITE_COLLECTION_ID=your_posts_collection_id
   VITE_APPWRITE_BUCKET_ID=your_storage_bucket_id
   
   # New collections for enhanced features
   VITE_APPWRITE_COMMENTS_COLLECTION_ID=your_comments_collection_id
   VITE_APPWRITE_USER_PROFILES_COLLECTION_ID=your_profiles_collection_id
   VITE_APPWRITE_CATEGORIES_COLLECTION_ID=your_categories_collection_id
   VITE_APPWRITE_TAGS_COLLECTION_ID=your_tags_collection_id
   VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID=your_notifications_collection_id
   ```

4. **Set up Appwrite Collections**
   Create the following collections in your Appwrite database:

   **Posts Collection** (existing - enhanced):
   ```json
   {
     "title": "string",
     "content": "string",
     "featuredimage": "string",
     "status": "boolean",
     "userId": "string",
     "categories": "string[]",
     "tags": "string[]",
     "createdAt": "datetime",
     "updatedAt": "datetime",
     "viewCount": "integer",
     "likeCount": "integer"
   }
   ```

   **Comments Collection** (new):
   ```json
   {
     "postId": "string",
     "userId": "string",
     "content": "string",
     "parentId": "string",
     "createdAt": "datetime",
     "updatedAt": "datetime",
     "isApproved": "boolean"
   }
   ```

   **User Profiles Collection** (new):
   ```json
   {
     "displayName": "string",
     "bio": "string",
     "avatar": "string",
     "socialLinks": "string",
     "createdAt": "datetime",
     "updatedAt": "datetime"
   }
   ```

   **Categories Collection** (new):
   ```json
   {
     "name": "string",
     "description": "string",
     "color": "string",
     "createdAt": "datetime"
   }
   ```

   **Tags Collection** (new):
   ```json
   {
     "name": "string",
     "createdAt": "datetime"
   }
   ```

   **Notifications Collection** (new):
   ```json
   {
     "userId": "string",
     "type": "string",
     "title": "string",
     "message": "string",
     "relatedId": "string",
     "isRead": "boolean",
     "createdAt": "datetime"
   }
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

## 🎯 Usage

### Comment System
- Users can comment on posts and reply to comments
- Threaded comment structure for better organization
- Authors receive notifications when someone comments on their posts
- Comment moderation system (isApproved field)

### User Profiles
- Customizable user profiles with display name and bio
- Social media links (website, GitHub, Twitter, LinkedIn)
- Profile pages showing user's posts
- Avatar support (can be extended with image upload)

### Categories & Tags
- Create and manage post categories with colors
- Add multiple tags to posts
- Filter posts by categories and tags
- Visual category and tag displays on posts

### Search Functionality
- Full-text search across post titles and content
- Advanced filtering by category, tag, and date range
- Real-time search suggestions
- Fuzzy search using Fuse.js

### Social Media Sharing
- Share posts on Facebook, Twitter, LinkedIn, WhatsApp, Reddit
- Email sharing option
- Copy link to clipboard
- Native sharing API support for mobile devices

### Notifications
- In-app notification center
- Email notification templates
- Notification types: comments, likes, follows, new posts
- Mark notifications as read/unread

## 🔧 Configuration

### Email Notifications
The current implementation includes email notification templates but requires integration with an email service provider. To enable email notifications:

1. Choose an email service (SendGrid, Mailgun, AWS SES, etc.)
2. Update the `sendEmailNotification` function in `src/utils/notifications.js`
3. Add your email service API keys to environment variables

### Social Media Sharing
Social sharing works out of the box, but you can customize:
- Default hashtags in `src/components/Social/SocialShare.jsx`
- Available sharing platforms
- Sharing button styles

### Search Configuration
Customize search behavior in `src/components/Search/SearchBar.jsx`:
- Fuse.js search options (threshold, keys)
- Number of search suggestions
- Search result display format

## 🎨 Customization

### Styling
The project uses Tailwind CSS for styling. Key customization points:
- Color scheme in `tailwind.config.js`
- Component styles in individual component files
- Global styles in `src/index.css`

### Components
All new components are modular and reusable:
- `src/components/Comments/` - Comment system components
- `src/components/Profile/` - User profile components
- `src/components/Search/` - Search functionality
- `src/components/Categories/` - Category management
- `src/components/Tags/` - Tag management
- `src/components/Social/` - Social sharing
- `src/components/Notifications/` - Notification system

## 📱 Mobile Responsiveness

All enhanced features are fully responsive:
- Mobile-optimized comment interface
- Responsive search bar
- Touch-friendly social sharing
- Mobile notification center
- Responsive profile pages

## 🔒 Security Considerations

- All user inputs are validated
- XSS protection through proper content sanitization
- Authentication required for sensitive operations
- Rate limiting should be implemented on the backend
- Email notification templates are sanitized

## 🚀 Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your hosting provider
3. Ensure all environment variables are set in production
4. Configure Appwrite collections with proper permissions
5. Set up email service for notifications (if using)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

## 🔄 Future Enhancements

Potential future features:
- Real-time notifications with WebSockets
- Advanced user roles and permissions
- Post scheduling
- SEO optimization
- Analytics dashboard
- Multi-language support
- Dark/light theme toggle
- Post bookmarking
- Advanced text editor features
- Image optimization and CDN integration

---

**Happy Blogging! 🎉**
