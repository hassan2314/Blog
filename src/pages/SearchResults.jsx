import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { FiSearch, FiFilter, FiTag, FiCalendar } from "react-icons/fi";
import { Container, PostCard, LoadingSpinner, SearchBar } from "../components";
import appwriteService from "../appwrite/config";
import Fuse from "fuse.js";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "",
    tag: "",
    dateRange: "",
  });

  const query = searchParams.get("q") || "";

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (posts.length > 0) {
      performSearch();
    }
  }, [query, posts, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [postsResponse, categoriesResponse, tagsResponse] =
        await Promise.all([
          appwriteService.getPosts(),
          appwriteService.getCategories(),
          appwriteService.getTags(),
        ]);

      if (postsResponse && postsResponse.documents) {
        setPosts(postsResponse.documents);
      }
      if (categoriesResponse && categoriesResponse.documents) {
        setCategories(categoriesResponse.documents);
      }
      if (tagsResponse && tagsResponse.documents) {
        setTags(tagsResponse.documents);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = () => {
    let results = [...posts];

    // Text search using Fuse.js
    if (query.trim()) {
      const fuse = new Fuse(posts, {
        keys: ["title", "content"],
        threshold: 0.4,
        includeScore: true,
      });
      const searchResults = fuse.search(query);
      results = searchResults.map((result) => result.item);
    }

    // Apply filters
    if (filters.category) {
      results = results.filter(
        (post) => post.categories && post.categories.includes(filters.category)
      );
    }

    if (filters.tag) {
      results = results.filter(
        (post) => post.tags && post.tags.includes(filters.tag)
      );
    }

    if (filters.dateRange) {
      const now = new Date();
      let filterDate = new Date();

      switch (filters.dateRange) {
        case "week":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case "year":
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          filterDate = null;
      }

      if (filterDate) {
        results = results.filter(
          (post) => new Date(post.createdAt) >= filterDate
        );
      }
    }

    setFilteredPosts(results);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      tag: "",
      dateRange: "",
    });
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.$id === categoryId);
    return category ? category.name : "Unknown";
  };

  const getTagName = (tagId) => {
    const tag = tags.find((t) => t.$id === tagId);
    return tag ? tag.name : "Unknown";
  };

  if (loading) {
    return (
      <Container>
        <div className="flex justify-center py-12">
          <LoadingSpinner className="w-12 h-12" />
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="space-y-8">
        {/* Search Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {query ? `Search Results for "${query}"` : "Search Posts"}
          </h1>
          <div className="max-w-md mx-auto">
            <SearchBar />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <FiFilter className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            </div>
            <button
              onClick={clearFilters}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiTag className="w-4 h-4 inline mr-1" />
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.$id} value={category.$id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tag Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiTag className="w-4 h-4 inline mr-1" />
                Tag
              </label>
              <select
                value={filters.tag}
                onChange={(e) => handleFilterChange("tag", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Tags</option>
                {tags.map((tag) => (
                  <option key={tag.$id} value={tag.$id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiCalendar className="w-4 h-4 inline mr-1" />
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) =>
                  handleFilterChange("dateRange", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Time</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="year">Past Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {filteredPosts.length}{" "}
              {filteredPosts.length === 1 ? "result" : "results"} found
            </h2>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <FiSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No results found
              </h3>
              <p className="text-gray-600 mb-4">
                {query
                  ? `No posts found matching "${query}". Try adjusting your search terms or filters.`
                  : "Try searching for something or adjusting your filters."}
              </p>
              <Link
                to="/"
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Browse all posts
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <PostCard key={post.$id} {...post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
