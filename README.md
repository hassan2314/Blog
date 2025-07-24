# MegaBlog

A modern, full-featured blogging platform built with React, Vite, and Appwrite. MegaBlog provides a complete content management system with user authentication, rich text editing, image uploads, and responsive design.

## ✨ Features

- **User Authentication**: Secure signup, login, and logout functionality
- **Rich Text Editor**: TinyMCE integration for creating and editing blog posts
- **Image Upload**: Featured image support for blog posts
- **Post Management**: Create, read, update, and delete blog posts
- **Draft System**: Save posts as drafts or publish them
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **State Management**: Redux Toolkit for efficient state management
- **Routing**: React Router for navigation and protected routes
- **Error Handling**: Comprehensive error boundaries and loading states
- **Modern UI**: Clean, professional interface with loading spinners and confirmations

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, JavaScript
- **Styling**: Tailwind CSS 4
- **State Management**: Redux Toolkit, React Redux
- **Routing**: React Router DOM
- **Backend**: Appwrite (Database, Authentication, Storage)
- **Rich Text Editor**: TinyMCE
- **Forms**: React Hook Form
- **Build Tool**: Vite
- **Linting**: ESLint

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Appwrite account and project setup

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd megablog
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   Create a `.env` file in the root directory and add your Appwrite configuration:

   ```env
   VITE_APPWRITE_URL=https://cloud.appwrite.io/v1
   VITE_APPWRITE_PROJECT_ID=your_project_id
   VITE_APPWRITE_DATABASE_ID=your_database_id
   VITE_APPWRITE_COLLECTION_ID=your_collection_id
   VITE_APPWRITE_BUCKET_ID=your_bucket_id
   ```

4. **Appwrite Setup**

   Set up your Appwrite project with:

   - A database with a collection for blog posts
   - A storage bucket for featured images
   - Authentication enabled
   - Proper permissions configured

5. **Start the development server**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── appwrite/          # Appwrite service configurations
│   ├── auth.js        # Authentication service
│   └── config.js      # Database and storage services
├── components/        # Reusable UI components
│   ├── Header/        # Navigation header
│   ├── Footer/        # Page footer
│   ├── Post-form/     # Post creation/editing form
│   ├── container/     # Layout containers
│   └── ...           # Other UI components
├── pages/            # Page components
│   ├── Home.jsx      # Homepage
│   ├── AllPosts.jsx  # Posts listing
│   ├── AddPost.jsx   # Create new post
│   ├── EditPost.jsx  # Edit existing post
│   ├── Post.jsx      # Individual post view
│   ├── Login.jsx     # Login page
│   └── Signup.jsx    # Registration page
├── store/            # Redux store configuration
│   ├── store.js      # Store setup
│   └── authSlice.js  # Authentication state
├── conf/             # Configuration files
│   └── conf.js       # Environment variables
├── App.jsx           # Main app component
└── main.jsx          # Application entry point
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎯 Usage

### For Users

1. **Registration**: Create a new account using the signup form
2. **Login**: Access your account with email and password
3. **Create Posts**: Use the rich text editor to write blog posts
4. **Add Images**: Upload featured images for your posts
5. **Manage Posts**: Edit, delete, or change the status of your posts
6. **Browse**: View all published posts on the homepage

### For Developers

1. **Authentication Flow**: The app uses Appwrite's authentication system with Redux for state management
2. **Protected Routes**: Some routes require authentication (managed by `AuthLayout` component)
3. **Error Handling**: Comprehensive error boundaries and loading states throughout the app
4. **Responsive Design**: Mobile-first approach with Tailwind CSS utilities

## 🔒 Authentication

The application uses Appwrite's authentication system with the following features:

- Email/password authentication
- Session management
- Protected routes
- Automatic logout on authentication errors

## 📝 Content Management

- **Rich Text Editing**: TinyMCE provides a full-featured editor
- **Image Uploads**: Featured images are stored in Appwrite storage
- **Draft System**: Posts can be saved as drafts or published
- **Post Metadata**: Title, slug, content, and status management

## 🎨 Styling

The application uses Tailwind CSS for styling with:

- Responsive design patterns
- Modern UI components
- Loading states and animations
- Error and success states
- Accessible form elements

## 🔧 Configuration

### Appwrite Setup

1. Create an Appwrite project
2. Set up a database with a collection for posts
3. Configure a storage bucket for images
4. Enable email/password authentication
5. Set appropriate permissions for collections and buckets

### Environment Variables

All configuration is handled through environment variables prefixed with `VITE_` for Vite compatibility.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🐛 Known Issues

- Ensure proper Appwrite permissions are set for all operations
- TinyMCE requires an internet connection for the editor to load
- Image uploads require proper CORS configuration in Appwrite

## 🔮 Future Enhancements

- Comment system
- User profiles
- Post categories and tags
- Search functionality
- Social media sharing
- Email notifications
- Admin dashboard

---

Built with ❤️ using React, Vite, and Appwrite
