import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import appwriteService from '../../appwrite/config';
import Fuse from 'fuse.js';

export default function SearchBar({ onSearch, placeholder = "Search posts..." }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [allPosts, setAllPosts] = useState([]);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const fuse = new Fuse(allPosts, {
    keys: ['title', 'content'],
    threshold: 0.4,
    includeScore: true,
  });

  useEffect(() => {
    fetchAllPosts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchAllPosts = async () => {
    try {
      const response = await appwriteService.getPosts();
      if (response && response.documents) {
        setAllPosts(response.documents);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim().length > 1) {
      const results = fuse.search(value);
      setSuggestions(results.slice(0, 5).map(result => result.item));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setShowSuggestions(false);

    try {
      if (onSearch) {
        onSearch(searchQuery);
      } else {
        // Navigate to search results page
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      }
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (post) => {
    setQuery('');
    setShowSuggestions(false);
    navigate(`/post/${post.$id}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FiX className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {suggestions.map((post) => (
            <button
              key={post.$id}
              onClick={() => handleSuggestionClick(post)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-gray-50"
            >
              <div className="font-medium text-gray-900 truncate">
                {post.title}
              </div>
              <div className="text-sm text-gray-500 truncate mt-1">
                {post.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 text-center">
          <div className="text-gray-500">Searching...</div>
        </div>
      )}
    </div>
  );
}