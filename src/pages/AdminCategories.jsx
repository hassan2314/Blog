import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  TagIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import categoryService from '../appwrite/categories';
import roleService from '../appwrite/roles';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import Input from '../components/Input';

const AdminCategories = () => {
  const { userData, userRole, permissions } = useSelector(state => state.auth);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    color: '#6366f1'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Check permissions
  const canCreate = roleService.hasPermission(permissions, 'category.create');
  const canUpdate = roleService.hasPermission(permissions, 'category.update');
  const canDelete = roleService.hasPermission(permissions, 'category.delete');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const result = await categoryService.getCategories(false); // Get all categories including inactive
      setCategories(result.documents);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canCreate && !editingCategory) return;
    if (!canUpdate && editingCategory) return;

    setSubmitting(true);
    setError('');

    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.$id, formData);
      } else {
        await categoryService.createCategory(formData);
      }
      
      await fetchCategories();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving category:', error);
      setError('Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category) => {
    if (!canUpdate) return;
    
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      slug: category.slug,
      color: category.color
    });
    setShowModal(true);
  };

  const handleDelete = async (category) => {
    if (!canDelete) return;
    
    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      try {
        await categoryService.deleteCategory(category.$id);
        await fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        setError('Failed to delete category');
      }
    }
  };

  const handleToggleActive = async (category) => {
    if (!canUpdate) return;
    
    try {
      await categoryService.updateCategory(category.$id, {
        isActive: !category.isActive
      });
      await fetchCategories();
    } catch (error) {
      console.error('Error toggling category status:', error);
      setError('Failed to update category status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      slug: '',
      color: '#6366f1'
    });
    setEditingCategory(null);
    setError('');
  };

  const handleSlugChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      slug: value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')
    }));
  };

  const generateSlug = () => {
    const slug = categoryService.slugify(formData.name);
    setFormData(prev => ({ ...prev, slug }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner className="w-12 h-12 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
              <p className="mt-2 text-gray-600">
                Manage post categories for content organization
              </p>
            </div>
            {canCreate && (
              <Button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Category
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.$id}
              className={`bg-white rounded-lg shadow-md overflow-hidden ${
                !category.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <div className="flex items-center space-x-2">
                    {canUpdate && (
                      <button
                        onClick={() => handleToggleActive(category)}
                        className="text-gray-400 hover:text-gray-600"
                        title={category.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {category.isActive ? (
                          <EyeIcon className="h-5 w-5" />
                        ) : (
                          <EyeSlashIcon className="h-5 w-5" />
                        )}
                      </button>
                    )}
                    {canUpdate && (
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-gray-400 hover:text-indigo-600"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(category)}
                        className="text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {category.description || 'No description'}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <TagIcon className="h-4 w-4 mr-1" />
                    <span className="font-mono">{category.slug}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Created {new Date(category.createdAt).toLocaleDateString()}
                  </span>
                  <span className={`px-2 py-1 rounded-full ${
                    category.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No categories</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new category.
            </p>
            {canCreate && (
              <div className="mt-6">
                <Button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Category
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingCategory ? 'Edit Category' : 'Create Category'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      label="Name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      onBlur={generateSlug}
                      required
                      placeholder="Enter category name"
                    />
                  </div>

                  <div>
                    <Input
                      label="Slug"
                      type="text"
                      value={formData.slug}
                      onChange={handleSlugChange}
                      required
                      placeholder="category-slug"
                      className="font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter category description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        className="font-mono text-sm flex-1"
                        placeholder="#6366f1"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {submitting ? (
                        <div className="flex items-center">
                          <LoadingSpinner className="w-4 h-4 mr-2" />
                          Saving...
                        </div>
                      ) : (
                        editingCategory ? 'Update' : 'Create'
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategories;