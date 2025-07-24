import React, { useState, useEffect } from 'react';
import { FiPlus, FiX, FiHash, FiAlertCircle } from 'react-icons/fi';
import { Button } from '../index';
import appwriteService from '../../appwrite/config';
import toast from 'react-hot-toast';

export default function TagSelector({ selectedTags = [], onTagsChange }) {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTagName, setNewTagName] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await appwriteService.getTags();
      if (response && response.documents) {
        setTags(response.documents);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
      if (error.code === 404) {
        setError('Tags collection not found. Please create the tags collection in your Appwrite database.');
      } else {
        setError('Failed to load tags. Please check your database configuration.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTagToggle = (tagId) => {
    const updatedTags = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId];
    
    onTagsChange(updatedTags);
  };

  const handleAddTag = async (tagName = newTagName) => {
    const trimmedName = tagName.trim();
    
    if (!trimmedName) {
      toast.error('Tag name is required');
      return;
    }

    // Check if tag already exists
    const existingTag = tags.find(tag => 
      tag.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existingTag) {
      // Add existing tag if not already selected
      if (!selectedTags.includes(existingTag.$id)) {
        onTagsChange([...selectedTags, existingTag.$id]);
      }
      setNewTagName('');
      setShowSuggestions(false);
      return;
    }

    try {
      const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const tag = await appwriteService.createTag({
        name: trimmedName,
        slug,
      });

      if (tag) {
        setTags(prev => [...prev, tag]);
        onTagsChange([...selectedTags, tag.$id]);
        setNewTagName('');
        setShowSuggestions(false);
        toast.success('Tag created successfully!');
        // Clear any previous errors
        setError(null);
      } else {
        toast.error('Failed to create tag');
      }
    } catch (error) {
      console.error('Error creating tag:', error);
      if (error.code === 404) {
        toast.error('Tags collection not found. Please create the collection first.');
      } else {
        toast.error('Failed to create tag');
      }
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewTagName(value);
    
    if (value.trim().length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const getTagById = (id) => {
    return tags.find(tag => tag.$id === id);
  };

  const getSuggestedTags = () => {
    if (!newTagName.trim()) return [];
    
    return tags
      .filter(tag => 
        tag.name.toLowerCase().includes(newTagName.toLowerCase()) &&
        !selectedTags.includes(tag.$id)
      )
      .slice(0, 5);
  };

  const suggestedTags = getSuggestedTags();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <FiHash className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">Tags</span>
        </div>
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <FiHash className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">Tags</span>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <FiAlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Collection Setup Required</h3>
              <p className="text-sm text-yellow-700 mt-1">{error}</p>
              <div className="mt-3">
                <button
                  onClick={fetchTags}
                  className="text-sm text-yellow-800 hover:text-yellow-900 font-medium"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <FiHash className="w-5 h-5 text-gray-600" />
        <span className="font-medium text-gray-900">Tags</span>
      </div>

      {/* Add Tag Input */}
      <div className="relative">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newTagName}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Add a tag..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            
            {/* Tag Suggestions */}
            {showSuggestions && suggestedTags.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-32 overflow-y-auto">
                {suggestedTags.map((tag) => (
                  <button
                    key={tag.$id}
                    onClick={() => handleAddTag(tag.name)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-gray-50"
                  >
                    <span className="text-gray-600">#</span>
                    {tag.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button
            type="button"
            onClick={() => handleAddTag()}
            className="flex items-center space-x-1"
            disabled={!newTagName.trim()}
          >
            <FiPlus className="w-4 h-4" />
            <span>Add</span>
          </Button>
        </div>
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <span className="text-sm font-medium text-gray-700">Selected Tags:</span>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tagId) => {
              const tag = getTagById(tagId);
              if (!tag) return null;
              
              return (
                <span
                  key={tagId}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border"
                >
                  <FiHash className="w-3 h-3 mr-1" />
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => handleTagToggle(tagId)}
                    className="ml-2 hover:bg-gray-200 rounded-full p-0.5"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Popular Tags */}
      {tags.length > 0 && (
        <div className="space-y-2">
          <span className="text-sm font-medium text-gray-700">Popular Tags:</span>
          <div className="flex flex-wrap gap-2">
            {tags
              .filter(tag => !selectedTags.includes(tag.$id))
              .slice(0, 10)
              .map((tag) => (
                <button
                  key={tag.$id}
                  onClick={() => handleTagToggle(tag.$id)}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                >
                  <FiHash className="w-3 h-3 mr-1" />
                  {tag.name}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}