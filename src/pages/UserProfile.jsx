import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { 
  UserIcon,
  PencilIcon,
  LinkIcon,
  MapPinIcon,
  GlobeAltIcon,
  CalendarIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import userProfileService from '../appwrite/userProfiles';
import service from '../appwrite/config';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import Input from '../components/Input';

const UserProfile = () => {
  const { userId } = useParams();
  const { userData: currentUser, permissions } = useSelector(state => state.auth);
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    website: '',
    location: '',
    socialLinks: {
      twitter: '',
      linkedin: '',
      github: ''
    },
    isPublic: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isOwnProfile = !userId || userId === currentUser?.$id;
  const targetUserId = userId || currentUser?.$id;

  useEffect(() => {
    if (targetUserId) {
      fetchProfile();
      fetchUserPosts();
    }
  }, [targetUserId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      let userProfile = await userProfileService.getProfileByUserId(targetUserId);
      
      if (!userProfile && isOwnProfile) {
        // Create profile if it doesn't exist for current user
        userProfile = await userProfileService.getOrCreateProfile(targetUserId, currentUser);
      }
      
      if (userProfile) {
        setProfile(userProfile);
        const socialLinks = userProfileService.parseSocialLinks(userProfile.socialLinks);
        setFormData({
          displayName: userProfile.displayName || '',
          bio: userProfile.bio || '',
          website: userProfile.website || '',
          location: userProfile.location || '',
          socialLinks: {
            twitter: socialLinks.twitter || '',
            linkedin: socialLinks.linkedin || '',
            github: socialLinks.github || ''
          },
          isPublic: userProfile.isPublic !== false
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      // Get posts by this user (you might need to add a query for userId)
      const posts = await service.getPosts();
      const userSpecificPosts = posts.documents.filter(post => post.userId === targetUserId);
      setUserPosts(userSpecificPosts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isOwnProfile) return;

    setSubmitting(true);
    setError('');

    try {
      await userProfileService.updateProfile(targetUserId, formData);
      await fetchProfile();
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    // Reset form data to current profile values
    if (profile) {
      const socialLinks = userProfileService.parseSocialLinks(profile.socialLinks);
      setFormData({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        website: profile.website || '',
        location: profile.location || '',
        socialLinks: {
          twitter: socialLinks.twitter || '',
          linkedin: socialLinks.linkedin || '',
          github: socialLinks.github || ''
        },
        isPublic: profile.isPublic !== false
      });
    }
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner className="w-12 h-12 text-indigo-600" />
      </div>
    );
  }

  if (!profile && !isOwnProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Profile not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            This user doesn't have a public profile or doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="px-6 py-8 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-20 w-20 rounded-full bg-indigo-500 flex items-center justify-center">
                  {profile?.avatar ? (
                    <img
                      src={profile.avatar}
                      alt="Profile"
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-10 w-10 text-white" />
                  )}
                </div>
                <div className="ml-6">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {editing ? (
                      <Input
                        value={formData.displayName}
                        onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                        placeholder="Display name"
                        className="text-2xl font-bold"
                      />
                    ) : (
                      profile?.displayName || currentUser?.name || 'Anonymous User'
                    )}
                  </h1>
                  <p className="text-gray-600">
                    {isOwnProfile ? 'Your Profile' : 'User Profile'}
                  </p>
                  {profile && (
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      Joined {new Date(profile.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
              
              {isOwnProfile && (
                <div className="flex items-center space-x-3">
                  {editing ? (
                    <>
                      <Button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {submitting ? (
                          <div className="flex items-center">
                            <LoadingSpinner className="w-4 h-4 mr-2" />
                            Saving...
                          </div>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setEditing(true)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Profile Info */}
              <div className="lg:col-span-1">
                <div className="space-y-6">
                  {/* Bio */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">About</h3>
                    {editing ? (
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Tell us about yourself..."
                      />
                    ) : (
                      <p className="text-gray-600">
                        {profile?.bio || 'No bio available.'}
                      </p>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Contact</h3>
                    <div className="space-y-3">
                      {/* Location */}
                      <div className="flex items-center">
                        <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                        {editing ? (
                          <Input
                            value={formData.location}
                            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                            placeholder="Location"
                            className="flex-1"
                          />
                        ) : (
                          <span className="text-gray-600">
                            {profile?.location || 'Location not specified'}
                          </span>
                        )}
                      </div>

                      {/* Website */}
                      <div className="flex items-center">
                        <GlobeAltIcon className="h-5 w-5 text-gray-400 mr-3" />
                        {editing ? (
                          <Input
                            value={formData.website}
                            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                            placeholder="https://example.com"
                            className="flex-1"
                          />
                        ) : profile?.website ? (
                          <a
                            href={profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            {profile.website}
                          </a>
                        ) : (
                          <span className="text-gray-600">No website</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Social Links</h3>
                    <div className="space-y-3">
                      {['twitter', 'linkedin', 'github'].map((platform) => (
                        <div key={platform} className="flex items-center">
                          <LinkIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-500 capitalize w-16">
                            {platform}:
                          </span>
                          {editing ? (
                            <Input
                              value={formData.socialLinks[platform]}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                socialLinks: {
                                  ...prev.socialLinks,
                                  [platform]: e.target.value
                                }
                              }))}
                              placeholder={`${platform} username`}
                              className="flex-1 ml-2"
                            />
                          ) : (
                            <span className="text-gray-600 ml-2">
                              {userProfileService.parseSocialLinks(profile?.socialLinks || '{}')[platform] || 'Not specified'}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Privacy Settings */}
                  {isOwnProfile && editing && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Privacy</h3>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isPublic"
                          checked={formData.isPublic}
                          onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
                          Make profile public
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Posts */}
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {isOwnProfile ? 'Your Posts' : 'Posts'} ({userPosts.length})
                  </h3>
                  
                  {userPosts.length > 0 ? (
                    <div className="space-y-4">
                      {userPosts.map((post) => (
                        <div key={post.$id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-lg font-medium text-gray-900 mb-2">
                                {post.title}
                              </h4>
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {post.content?.substring(0, 150)}...
                              </p>
                              <div className="flex items-center text-xs text-gray-500">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                {new Date(post.$createdAt).toLocaleDateString()}
                                <span className="mx-2">•</span>
                                <span className={`px-2 py-1 rounded-full ${
                                  post.status 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {post.status ? 'Published' : 'Draft'}
                                </span>
                              </div>
                            </div>
                            {post.featuredimage && (
                              <div className="ml-4 flex-shrink-0">
                                <img
                                  src={service.getImagePreview(post.featuredimage)}
                                  alt={post.title}
                                  className="h-16 w-16 object-cover rounded-md"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        {isOwnProfile ? "You haven't written any posts yet." : "This user hasn't written any posts yet."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;