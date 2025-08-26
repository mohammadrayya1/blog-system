import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AxiosAuth } from "../components/Api/Axios";
import { toast } from "react-toastify";

async function createPost(formData) {
  const res = await AxiosAuth.post("/addnewpost", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

async function fetchCategories() {
  const res = await AxiosAuth.get("/categories");
  const body = res.data;
  const cats = body?.categories ?? body?.data;
  if (!Array.isArray(cats)) throw new Error("Invalid categories payload");
  return cats;
}

export default function Write() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    content: "",
    image: null,
    categoryIds: [],
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { data: categories = [], isLoading: catLoading, isError: catErr } =
      useQuery({
        queryKey: ["categories"],
        queryFn: fetchCategories,
        staleTime: 60_000,
      });

  const { mutate } = useMutation({
    mutationFn: createPost,
    onSuccess: (data) => {
      toast.success("✅ Post created successfully");
      navigate(data?.id ? `/${data.id}` : "/");
    },
    onError: (err) => {
      const apiErrors = err?.response?.data?.errors;
      if (apiErrors && typeof apiErrors === "object") {
        setErrors(apiErrors);
      } else {
        toast.error(err?.response?.data?.error || "Failed to create post");
      }
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((err) => ({ ...err, [name]: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setForm((f) => ({ ...f, image: file }));
    setErrors((err) => ({ ...err, image: "" }));
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const toggleCat = (id) => {
    setForm((prev) => {
      const already = prev.categoryIds.includes(id);
      return {
        ...prev,
        categoryIds: already
            ? prev.categoryIds.filter((c) => c !== id)
            : [...prev.categoryIds, id],
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    if (!form.content.trim()) {
      setErrors((err) => ({ ...err, content: "Content is required" }));
      return;
    }
    if (form.categoryIds.length === 0) {
      setErrors((err) => ({ ...err, categoryIds: "Pick at least one category" }));
      return;
    }

    const fd = new FormData();
    fd.append("content", form.content.trim());
    if (form.image) fd.append("image", form.image);
    form.categoryIds.forEach((id) => fd.append("categoryIds[]", String(id)));

    // Debug log:
    for (let [k, v] of fd.entries()) console.log(k, v);

    setLoading(true);
    mutate(fd, {
      onSettled: () => setLoading(false),
    });
  };

  return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white shadow-xl rounded-2xl w-full p-8">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            ✍️ Create New Post
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Content */}
            <div>
              <label className="block text-sm font-medium mb-2">Post Content</label>
              <input
                  type="text"
                  name="content"
                  placeholder="Write your post…"
                  value={form.content}
                  onChange={handleChange}
                  className={`p-3 border rounded-xl w-full ${
                      errors.content ? "border-red-500" : "border-gray-300"
                  }`}
              />
              {errors.content && (
                  <p className="text-red-600 text-xs mt-1">{errors.content}</p>
              )}
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium mb-2">Categories</label>
              {catLoading ? (
                  <p className="text-sm text-gray-500">Loading categories…</p>
              ) : catErr ? (
                  <p className="text-sm text-red-600">Failed to load categories.</p>
              ) : (
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => {
                      const active = form.categoryIds.includes(cat.id);
                      return (
                          <button
                              key={cat.id}
                              type="button"
                              onClick={() => toggleCat(cat.id)}
                              className={`px-3 py-1 rounded-full border text-sm transition ${
                                  active
                                      ? "bg-blue-600 text-white border-blue-600"
                                      : "bg-white text-gray-700 hover:bg-gray-50"
                              }`}
                          >
                            {cat.name}
                          </button>
                      );
                    })}
                  </div>
              )}
              {errors.categoryIds && (
                  <p className="text-red-600 text-xs mt-1">{errors.categoryIds}</p>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Upload Image</label>
              <div className="flex items-center gap-4">
                <input
                    ref={fileRef}
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className={`block w-full text-sm text-gray-600 
          file:mr-4 file:py-2 file:px-4
          file:rounded-lg file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-600 file:text-white
          hover:file:bg-blue-700
          ${errors.image ? "border-red-500" : "border-gray-300"}
        `}
                />
                {imagePreview && (
                    <div className="w-32 h-32 rounded-xl overflow-hidden border">
                      <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                      />
                    </div>
                )}
              </div>
              {errors.image && (
                  <p className="text-red-600 text-xs mt-1">{errors.image}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="px-5 py-2 rounded-xl border text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-2 rounded-xl text-white font-semibold ${
                      loading
                          ? "bg-blue-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                  }`}
              >
                {loading ? "Publishing…" : "Publish"}
              </button>
            </div>
          </form>

        </div>
      </div>
  );
}
