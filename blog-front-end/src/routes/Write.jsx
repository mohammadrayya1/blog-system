// src/routes/Write.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AxiosAuth } from "../components/Api/Axios";
import { toast } from "react-toastify";
import { useAuth } from "../components/AuthContext";

async function createPost(formData) {
  const res = await AxiosAuth.post("/addNewpost", formData, {
  });
  return res.data;
}
async function fetchCategories() {
  const res = await AxiosAuth.get("/categories");
  const body = res.data;
  const cats = body?.categories ?? body?.data;        // يدعم الشكلين
  if (!Array.isArray(cats)) throw new Error("Invalid categories payload");
  return cats;
}
export default function Write() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const viewerId = user?.id ?? "guest";

  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [selectedCats, setSelectedCats] = useState([]);

  const DRAFT_KEY = `draft:write:${viewerId}`;
  const dirty = Boolean(description || content || file || selectedCats.length > 0);

  // categories query
  const { data: categories = [], isLoading: catLoading, isError: catErr } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 60_000,
  });

  // Load draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        setDescription(d.description || "");
        setContent(d.content || "");
        setSelectedCats(Array.isArray(d.categoryIds) ? d.categoryIds : []);
      }
    } catch {}
  }, [DRAFT_KEY]);

  // Debounced autosave (include categories)
  useEffect(() => {
    const t = setTimeout(() => {
      if (description || content || selectedCats.length > 0) {
        localStorage.setItem(
            DRAFT_KEY,
            JSON.stringify({ description, content, categoryIds: selectedCats })
        );
      } else {
        localStorage.removeItem(DRAFT_KEY);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [description, content, selectedCats, DRAFT_KEY]);

  // Warn on unload if dirty
  useEffect(() => {
    const handler = (e) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // Online/Offline
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const { mutate, isPending } = useMutation({
    mutationFn: createPost,
    onSuccess: (data) => {
      toast.success("Post published ✅");
      localStorage.removeItem(DRAFT_KEY);
      const newId = data?.id ?? data?.data?.id;
      navigate(newId ? `/${newId}` : "/");
    },
    onError: (err) => {
      const status = err?.response?.status;
      if (status === 429) toast.error("You are posting too frequently. Try later.");
      else if (status === 413) toast.error("Image is too large.");
      else toast.error(err?.response?.data?.error || "Failed to create post.");
    },
  });

  const onSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return toast.info("Description is required.");
    if (selectedCats.length === 0) return toast.info("Please select at least one category.");
    if (!isOnline) {
      toast.info("You are offline. Saved locally as a draft.");
      return;
    }

    const fd = new FormData();
    fd.append("description", description.trim());
    if (content.trim()) fd.append("content", content.trim());
    if (file) fd.append("image", file);
    selectedCats.forEach((id) => fd.append("categoryIds[]", String(id))); // << send as array
    mutate(fd);
  };

  const toggleCat = (id) => {
    setSelectedCats((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">✍️ Create New Post</h1>
          {!isOnline && (
              <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Offline</span>
          )}
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description (required)</label>
            <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a short description…"
                className="w-full rounded-lg border px-3 py-2 outline-none focus:ring focus:ring-blue-200"
                maxLength={180}
                required
            />
            <div className="text-xs text-gray-500 mt-1">{description.length}/180</div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-1">Content (optional)</label>
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Post body…"
                rows={6}
                className="w-full rounded-lg border px-3 py-2 outline-none focus:ring focus:ring-blue-200"
            />
          </div>

          {/* Categories (required at least one) */}
          <div>
            <label className="block text-sm font-medium mb-2">Categories (required)</label>

            {catLoading ? (
                <p className="text-sm text-gray-500">Loading categories…</p>
            ) : catErr ? (
                <p className="text-sm text-red-600">Failed to load categories.</p>
            ) : (
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const active = selectedCats.includes(cat.id);
                    return (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => toggleCat(cat.id)}
                            className={`px-3 py-1 rounded-full border text-sm transition
                      ${active ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 hover:bg-gray-50"}
                    `}
                            aria-pressed={active}
                            title={cat.name}
                        >
                          {cat.name}
                        </button>
                    );
                  })}
                </div>
            )}

            {/* Optional: plain checkboxes instead of chips */}
            {/* <div className="mt-3 grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedCats.includes(cat.id)}
                  onChange={() => toggleCat(cat.id)}
                />
                {cat.name}
              </label>
            ))}
          </div> */}
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium mb-2">Image (optional)</label>
            <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white hover:file:bg-blue-700"
            />
            {file && (
                <div className="mt-3 w-28 h-28 rounded-lg overflow-hidden border">
                  <img
                      src={URL.createObjectURL(file)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)}
                  />
                </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
                type="submit"
                disabled={isPending || !isOnline}
                className={`px-5 py-2 rounded-3xl text-white ${
                    isPending || !isOnline
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-700 hover:bg-blue-800"
                }`}
            >
              {isPending ? "Publishing…" : "Publish"}
            </button>
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 rounded-3xl border hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
  );
}