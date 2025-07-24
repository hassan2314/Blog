import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FiEdit3, FiSave, FiX, FiUser, FiMail, FiGlobe, FiGithub, FiTwitter, FiLinkedin } from 'react-icons/fi';
import { Button, Input } from '../index';
import appwriteService from '../../appwrite/config';
import toast from 'react-hot-toast';

export default function UserProfile({ userId }) {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    socialLinks: {
      website: '',
      github: '',
      twitter: '',
      linkedin: '',
    },
  });

  const userData = useSelector((state) => state.auth.userData);
  const isOwnProfile = userData && userData.$id === userId;

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const profileData = await appwriteService.getUserProfile(userId);
      
      if (profileData) {
        setProfile(profileData);
        setFormData({
          displayName: profileData.displayName || '',
          bio: profileData.bio || '',
          socialLinks: profileData.socialLinks ? JSON.parse(profileData.socialLinks) : {
            website: '',
            github: '',
            twitter: '',
            linkedin: '',
          },
        });
      } else if (isOwnProfile) {
        // Create profile if it doesn't exist for the current user
        await createInitialProfile();
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const createInitialProfile = async () => {
    try {
      const newProfile = await appwriteService.createUserProfile({
        userId,
        displayName: userData.name || 'Anonymous User',
        bio: '',
        avatar: '',
        socialLinks: {},
      });
      
      if (newProfile) {
        setProfile(newProfile);
        setFormData({
          displayName: newProfile.displayName,
          bio: newProfile.bio,
          socialLinks: {
            website: '',
            github: '',
            twitter: '',
            linkedin: '',
          },
        });
      }
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedProfile = await appwriteService.updateUserProfile(userId, {
        displayName: formData.displayName,
        bio: formData.bio,
        avatar: profile?.avatar || '',
        socialLinks: formData.socialLinks,
      });

      if (updatedProfile) {
        setProfile(updatedProfile);
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        socialLinks: profile.socialLinks ? JSON.parse(profile.socialLinks) : {
          website: '',
          github: '',
          twitter: '',
          linkedin: '',
        },
      });
    }
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSocialLinkChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiUser className="w-12 h-12 text-indigo-600" />
        </div>
        
        {isEditing ? (
          <div className="space-y-4">
            <Input
              type="text"
              value={formData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              placeholder="Display Name"
              className="text-center"
            />
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {profile?.displayName || 'Anonymous User'}
            </h2>
            {profile?.bio && (
              <p className="text-gray-600 mb-4">{profile.bio}</p>
            )}
          </div>
        )}
      </div>

      {/* Social Links */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Social Links</h3>
        
        {isEditing ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <FiGlobe className="w-5 h-5 text-gray-500" />
              <Input
                type="url"
                value={formData.socialLinks.website}
                onChange={(e) => handleSocialLinkChange('website', e.target.value)}
                placeholder="Website URL"
                className="flex-1"
              />
            </div>
            <div className="flex items-center space-x-3">
              <FiGithub className="w-5 h-5 text-gray-500" />
              <Input
                type="url"
                value={formData.socialLinks.github}
                onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                placeholder="GitHub URL"
                className="flex-1"
              />
            </div>
            <div className="flex items-center space-x-3">
              <FiTwitter className="w-5 h-5 text-gray-500" />
              <Input
                type="url"
                value={formData.socialLinks.twitter}
                onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                placeholder="Twitter URL"
                className="flex-1"
              />
            </div>
            <div className="flex items-center space-x-3">
              <FiLinkedin className="w-5 h-5 text-gray-500" />
              <Input
                type="url"
                value={formData.socialLinks.linkedin}
                onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                placeholder="LinkedIn URL"
                className="flex-1"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {profile?.socialLinks && JSON.parse(profile.socialLinks).website && (
              <a
                href={JSON.parse(profile.socialLinks).website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800"
              >
                <FiGlobe className="w-4 h-4" />
                <span>Website</span>
              </a>
            )}
            {profile?.socialLinks && JSON.parse(profile.socialLinks).github && (
              <a
                href={JSON.parse(profile.socialLinks).github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800"
              >
                <FiGithub className="w-4 h-4" />
                <span>GitHub</span>
              </a>
            )}
            {profile?.socialLinks && JSON.parse(profile.socialLinks).twitter && (
              <a
                href={JSON.parse(profile.socialLinks).twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800"
              >
                <FiTwitter className="w-4 h-4" />
                <span>Twitter</span>
              </a>
            )}
            {profile?.socialLinks && JSON.parse(profile.socialLinks).linkedin && (
              <a
                href={JSON.parse(profile.socialLinks).linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800"
              >
                <FiLinkedin className="w-4 h-4" />
                <span>LinkedIn</span>
              </a>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      {isOwnProfile && (
        <div className="mt-6 flex justify-center space-x-3">
          {isEditing ? (
            <>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2"
              >
                <FiSave className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <FiX className="w-4 h-4" />
                <span>Cancel</span>
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2"
            >
              <FiEdit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}