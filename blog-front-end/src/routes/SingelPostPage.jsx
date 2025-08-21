// routes/SingelPostPage.jsx
import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosUser, AxiosAuth } from "../components/Api/Axios";
import ImageKit from "../components/ImageKit.jsx";
import { format } from "timeago.js";
import { useAuth } from "../components/AuthContext";

// --- API ---
const fetchPost = async (id) => {
  const res = await AxiosUser.get(`/post/${id}`);
  return res.data.data; // يتوقع { ..., likedByMe, likes, ... }
};

const likePost = async (id) => {
  const res = await AxiosAuth.post(`/post/${id}/like`, {}); // {} لضبط Content-Type
  return res.data; // يفضّل يرجّع { likes, liked }
};

// --- Component ---
const SingelPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // جلب تفاصيل البوست
  const {
    data: post,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["post", id],
    queryFn: () => fetchPost(id),
  });

  // Mutation للايك مع تحديث متفائل
  const likeMutation = useMutation({
    mutationFn: () => likePost(id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["post", id] });
      const previous = queryClient.getQueryData(["post", id]);

      // تحديث فوري (تفاؤلي)
      if (previous) {
        queryClient.setQueryData(["post", id], (old) => {
          if (!old) return old;
          const likedNow = !old.likedByMe;
          return {
            ...old,
            likedByMe: likedNow,
            likes: Math.max(0, (old.likes || 0) + (likedNow ? 1 : -1)),
          };
        });
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      // تراجع لو حدث خطأ
      if (ctx?.previous) {
        queryClient.setQueryData(["post", id], ctx.previous);
      }
    },
    onSuccess: (data) => {
      // مزامنة مع رد السيرفر إن وفّر قيمًا دقيقة
      queryClient.setQueryData(["post", id], (old) => {
        if (!old) return old;
        const likes =
            typeof data?.likes === "number" ? data.likes : old.likes;
        const liked =
            typeof data?.liked === "boolean" ? data.liked : old.likedByMe;
        return { ...old, likes, likedByMe: liked };
      });
    },
  });

  const handleLike = () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${location.pathname}`);
      return;
    }
    likeMutation.mutate();
  };

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading post. {error?.message}</p>;
  if (!post) return <p>Post not found.</p>;

  return (
      <div className="max-w-2xl mx-auto px-4 py-8 bg-white shadow rounded-lg">
        {/* الهيدر (User Info) */}
        <div className="flex items-center gap-3 mb-6">
          <ImageKit
              src={post.userImage}
              alt={post.user}
              className="w-12 h-12 rounded-full border object-cover"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-blue-800">{post.user}</span>
            <span className="text-xs text-gray-500">
            {post.createdAt ? format(post.createdAt) : ""}
          </span>
          </div>
        </div>

        {/* وصف/عنوان البوست */}
        <h1 className="text-xl font-semibold mb-4">{post.description}</h1>

        {/* صورة البوست */}
        {post.image && (
            <div className="mb-6">
              <ImageKit
                  src={post.image}
                  className="rounded-lg w-full object-cover"
                  w="900"
              />
            </div>
        )}

        {/* محتوى البوست */}
        {post.content && (
            <div
                className="prose prose-lg max-w-none mb-6"
                dangerouslySetInnerHTML={{ __html: post.content }}
            />
        )}

        {/* أكشنز */}
        <div className="flex justify-between items-center text-sm text-gray-600 border-t pt-4">
          <button
              onClick={handleLike}
              aria-pressed={!!post.likedByMe}
              disabled={likeMutation.isPending}
              className={`flex items-center gap-2 font-semibold transition ${
                  post.likedByMe ? "text-red-600" : "text-blue-600"
              } ${likeMutation.isPending ? "opacity-60 cursor-not-allowed" : ""}`}
              title={post.likedByMe ? "Dislike" : "Like"}
          >
            {post.likedByMe ? "❤️ Liked" : "👍 Like"}
            <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-800">
            {post.likes ?? 0}
          </span>
          </button>

          <span>💬 {post.comments?.length ?? 0} Comments</span>
        </div>
      </div>
  );
};

export default SingelPostPage;
