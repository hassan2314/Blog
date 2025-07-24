import React, { useCallback, useEffect, useState } from "react";
import { Input, Button, Select, RTE, LoadingSpinner } from "../index.js";
import { useForm } from "react-hook-form";
import appwriteServices from "../../appwrite/config.js";
import categoryService from "../../appwrite/categories.js";
import tagService from "../../appwrite/tags.js";
import roleService from "../../appwrite/roles.js";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { XMarkIcon } from "@heroicons/react/24/solid";

export default function PostForm({ post }) {
  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: post?.title || "",
      slug: post?.slug || "",
      content: post?.content || "",
      status: post?.status ? "active" : "inactive",
      categoryId: post?.categoryId || "",
    },
  });

  const navigate = useNavigate();
  const { userData, permissions } = useSelector((state) => state.auth);
  const [imagePreview, setImagePreview] = useState(
    post?.featuredimage
      ? appwriteServices.getImagePreview(post.featuredimage)
      : null
  );
  const [isUploading, setIsUploading] = useState(false);
  
  // Categories and tags state
  const [categories, setCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  // Check permissions
  const canUseCategories = roleService.hasPermission(permissions, 'category.read');
  const canUseTags = roleService.hasPermission(permissions, 'tag.create') || roleService.hasPermission(permissions, 'tag.read');

  const slugTransform = useCallback((value) => {
    if (value && typeof value === "string") {
      return value
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
    }
    return "";
  }, []);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "title") {
        const generatedSlug = slugTransform(value.title);
        setValue("slug", generatedSlug, { shouldValidate: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue, slugTransform]);

  // Load categories and tags on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load categories if user has permission
        if (canUseCategories) {
          const categoriesResult = await categoryService.getCategories(true);
          setCategories(categoriesResult.documents);
        }

        // Load existing tags for this post
        if (post && post.tags) {
          const postTags = appwriteServices.parsePostTags(post.tags);
          setSelectedTags(postTags);
        }
      } catch (error) {
        console.error("Error loading form data:", error);
      }
    };

    loadData();
  }, [canUseCategories, post]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Tag handling functions
  const handleTagInputChange = async (e) => {
    const value = e.target.value;
    setTagInput(value);

    if (value.length > 1) {
      try {
        const suggestions = await tagService.searchTags(value, 5);
        setTagSuggestions(suggestions.documents);
        setShowTagSuggestions(true);
      } catch (error) {
        console.error("Error searching tags:", error);
      }
    } else {
      setShowTagSuggestions(false);
    }
  };

  const addTag = async (tagName) => {
    if (!tagName.trim()) return;
    
    // Check if tag already selected
    if (selectedTags.some(tag => tag.name.toLowerCase() === tagName.toLowerCase())) {
      setTagInput("");
      setShowTagSuggestions(false);
      return;
    }

    try {
      // Get or create tag
      const tag = await tagService.getOrCreateTag(tagName.trim(), userData.$id);
      setSelectedTags(prev => [...prev, tag]);
      setTagInput("");
      setShowTagSuggestions(false);
    } catch (error) {
      console.error("Error adding tag:", error);
    }
  };

  const removeTag = (tagId) => {
    setSelectedTags(prev => prev.filter(tag => tag.$id !== tagId));
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === 'Escape') {
      setShowTagSuggestions(false);
    }
  };

  const submit = async (data) => {
    try {
      setIsUploading(true);
      data.status = data.status === "active";

      // Prepare category and tags data
      const categoryId = data.categoryId || null;
      const tags = selectedTags.map(tag => ({ id: tag.$id, name: tag.name, slug: tag.slug }));

      if (post) {
        // Update existing post
        let fileId = post.featuredimage;

        if (data.image?.[0]) {
          const file = await appwriteServices.uploadImage(data.image[0]);
          await appwriteServices.deleteImage(post.featuredimage);
          fileId = file.$id;
        }

        const dbPost = await appwriteServices.updatePost(post.$id, {
          ...data,
          featuredImage: fileId,
          categoryId,
          tags,
        });

        if (dbPost) {
          navigate(`/post/${dbPost.$id}`);
        }
      } else {
        // Create new post
        if (!data.image?.[0]) {
          throw new Error("Featured image is required");
        }

        const file = await appwriteServices.uploadImage(data.image[0]);
        const dbPost = await appwriteServices.createPost({
          ...data,
          featuredimage: file.$id,
          userId: userData.$id,
          categoryId,
          tags,
        });

        if (dbPost) {
          navigate(`/post/${dbPost.$id}`);
        }
      }
    } catch (error) {
      console.error("Error submitting post:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="flex flex-col md:flex-row gap-8"
    >
      {/* Left side - Content */}
      <div className="w-full md:w-2/3 space-y-6">
        <div>
          <Input
            label="Title"
            placeholder="Enter post title"
            className="mb-1"
            error={errors.title?.message}
            {...register("title", {
              required: "Title is required",
              minLength: {
                value: 5,
                message: "Title must be at least 5 characters",
              },
            })}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <Input
            label="Slug"
            placeholder="Post slug"
            className="mb-1"
            error={errors.slug?.message}
            {...register("slug", {
              required: "Slug is required",
              pattern: {
                value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                message:
                  "Slug can only contain lowercase letters, numbers and hyphens",
              },
            })}
            onInput={(e) => {
              const newSlug = slugTransform(e.currentTarget.value);
              setValue("slug", newSlug, { shouldValidate: true });
            }}
          />
          {errors.slug && (
            <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>
          )}
        </div>

        <div>
          <RTE
            label="Content"
            name="content"
            control={control}
            defaultValue={getValues("content")}
            className="min-h-[300px]"
          />
        </div>
      </div>

      {/* Right side - Meta */}
      <div className="w-full md:w-1/3 space-y-6">
        <div>
          <Input
            label="Featured Image"
            type="file"
            accept="image/png, image/jpg, image/jpeg, image/gif, image/webp"
            {...register("image", {
              required: !post && "Featured image is required",
              validate: {
                lessThan5MB: (files) =>
                  !files?.[0] ||
                  files[0]?.size < 5000000 ||
                  "Max 5MB size allowed",
                acceptedFormats: (files) =>
                  !files?.[0] ||
                  [
                    "image/jpeg",
                    "image/png",
                    "image/webp",
                    "image/gif",
                  ].includes(files[0]?.type) ||
                  "Only JPEG, PNG, WEBP or GIF images are allowed",
              },
            })}
            onChange={handleImageChange}
          />
          {errors.image && (
            <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>
          )}

          {(imagePreview || post?.featuredimage) && (
            <div className="mt-4">
              <img
                src={
                  imagePreview ||
                  appwriteServices.getImagePreview(post.featuredimage)
                }
                alt="Preview"
                className="rounded-lg w-full h-48 object-cover border border-gray-200"
              />
            </div>
          )}
        </div>

        {/* Category Selection */}
        {canUseCategories && categories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              {...register("categoryId")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.$id} value={category.$id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tags Input */}
        {canUseTags && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            
            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedTags.map((tag) => (
                  <span
                    key={tag.$id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                  >
                    {tag.name}
                    <button
                      type="button"
                      onClick={() => removeTag(tag.$id)}
                      className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-indigo-200"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Tag Input */}
            <div className="relative">
              <input
                type="text"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagKeyPress}
                onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                placeholder="Type to add tags..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              
              {/* Tag Suggestions */}
              {showTagSuggestions && tagSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                  {tagSuggestions.map((tag) => (
                    <button
                      key={tag.$id}
                      type="button"
                      onClick={() => addTag(tag.name)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                    >
                      <span className="font-medium">{tag.name}</span>
                    </button>
                  ))}
                  {/* Add new tag option */}
                  {tagInput && !tagSuggestions.some(tag => tag.name.toLowerCase() === tagInput.toLowerCase()) && (
                    <button
                      type="button"
                      onClick={() => addTag(tagInput)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-t border-gray-200"
                    >
                      <span className="text-indigo-600">+ Create "{tagInput}"</span>
                    </button>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Press Enter to add a tag, or select from suggestions
            </p>
          </div>
        )}

        <div>
          <Select
            options={["active", "inactive"]} // Simplified to array of strings
            label="Status"
            {...register("status", { required: "Status is required" })}
          />

          {errors.status && (
            <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || isUploading}
        >
          {isSubmitting || isUploading ? (
            <div className="flex items-center justify-center">
              <LoadingSpinner className="w-5 h-5 mr-2" />
              {post ? "Updating..." : "Publishing..."}
            </div>
          ) : post ? (
            "Update Post"
          ) : (
            "Publish Post"
          )}
        </Button>
      </div>
    </form>
  );
}
