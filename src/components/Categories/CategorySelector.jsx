import React, { useState, useEffect } from 'react';
import { FiPlus, FiX, FiTag } from 'react-icons/fi';
import { Button } from '../index';
import appwriteService from '../../appwrite/config';
import toast from 'react-hot-toast';

export default function CategorySelector({ selectedCategories = [], onCategoriesChange }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await appwriteService.getCategories();
      if (response && response.documents) {
        setCategories(response.documents);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (categoryId) => {
    const updatedCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    
    onCategoriesChange(updatedCategories);
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    if (!newCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      const slug = newCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const category = await appwriteService.createCategory({
        name: newCategory.name.trim(),
        slug,
        description: newCategory.description.trim(),
        color: newCategory.color,
      });

      if (category) {
        setCategories(prev => [...prev, category]);
        setNewCategory({ name: '', description: '', color: '#3B82F6' });
        setShowAddForm(false);
        toast.success('Category created successfully!');
      } else {
        toast.error('Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
    }
  };

  const getCategoryById = (id) => {
    return categories.find(cat => cat.$id === id);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <FiTag className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">Categories</span>
        </div>
        <div className="animate-pulse space-y-2">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FiTag className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">Categories</span>
        </div>
        <Button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-sm flex items-center space-x-1"
          variant="outline"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add Category</span>
        </Button>
      </div>

      {/* Add Category Form */}
      {showAddForm && (
        <form onSubmit={handleAddCategory} className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div>
            <input
              type="text"
              value={newCategory.name}
              onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Category name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <input
              type="text"
              value={newCategory.description}
              onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-3">
            <label className="text-sm text-gray-700">Color:</label>
            <input
              type="color"
              value={newCategory.color}
              onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
              className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
            />
          </div>
          <div className="flex space-x-2">
            <Button type="submit" className="text-sm">
              Create
            </Button>
            <Button
              type="button"
              onClick={() => setShowAddForm(false)}
              variant="outline"
              className="text-sm"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Selected Categories */}
      {selectedCategories.length > 0 && (
        <div className="space-y-2">
          <span className="text-sm font-medium text-gray-700">Selected:</span>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((categoryId) => {
              const category = getCategoryById(categoryId);
              if (!category) return null;
              
              return (
                <span
                  key={categoryId}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: category.color }}
                >
                  {category.name}
                  <button
                    type="button"
                    onClick={() => handleCategoryToggle(categoryId)}
                    className="ml-2 hover:bg-black hover:bg-opacity-20 rounded-full p-0.5"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Categories */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-gray-700">Available Categories:</span>
        <div className="max-h-48 overflow-y-auto space-y-2">
          {categories.length === 0 ? (
            <p className="text-sm text-gray-500">No categories available. Create one above.</p>
          ) : (
            categories.map((category) => (
              <label
                key={category.$id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.$id)}
                  onChange={() => handleCategoryToggle(category.$id)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex items-center space-x-2 flex-1">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {category.name}
                    </div>
                    {category.description && (
                      <div className="text-xs text-gray-500">
                        {category.description}
                      </div>
                    )}
                  </div>
                </div>
              </label>
            ))
          )}
        </div>
      </div>
    </div>
  );
}