import React, { useCallback, useEffect, useState } from "react";
import { Input, Button, Select, RTE, LoadingSpinner, CategorySelector, TagSelector } from "../index.js";
import { useForm } from "react-hook-form";
import appwriteServices from "../../appwrite/config.js";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

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
    },
  });

  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);
  const [imagePreview, setImagePreview] = useState(
    post?.featuredimage
      ? appwriteServices.getImagePreview(post.featuredimage)
      : null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(post?.categories || []);
  const [selectedTags, setSelectedTags] = useState(post?.tags || []);

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

  const submit = async (data) => {
    try {
      setIsUploading(true);
      data.status = data.status === "active";

      if (post) {
        // Update existing post
        let fileId = post.featuredimage;

        if (data.image?.[0]) {
          const file = await appwriteServices.uploadImage(data.image[0]);
          await appwriteServices.deleteFile(post.featuredimage);
          fileId = file.$id;
        }

        const dbPost = await appwriteServices.updatePost(post.$id, {
          ...data,
          featuredimage: fileId,
          categories: selectedCategories,
          tags: selectedTags,
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
          categories: selectedCategories,
          tags: selectedTags,
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

        {/* Categories */}
        <div>
          <CategorySelector
            selectedCategories={selectedCategories}
            onCategoriesChange={setSelectedCategories}
          />
        </div>

        {/* Tags */}
        <div>
          <TagSelector
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
          />
        </div>

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
