// routes/SingelPostPage.jsx
import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosUser, AxiosAuth } from "../components/Api/Axios";
import ImageKit from "../components/ImageKit.jsx";
import { format } from "timeago.js";
import { useAuth } from "../components/AuthContext";
import Comment from "../components/Comment.jsx";
import AddComment from "../components/AddComment.jsx";


const fetchPostAuthedAware = async ({ queryKey }) => {
  const [_key, id, viewerId] = queryKey;
  const client = viewerId ? AxiosAuth : AxiosUser;
  const res = await client.get(`/post/${id}`);
  return res.data.data;
};

const likePost = async (id) => {
  const res = await AxiosAuth.post(`/post/${id}/like`, {});

  return res.data;
};


const SingelPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading, user: authUser } = useAuth();
  const viewerId = authUser?.id ?? null;
  const queryClient = useQueryClient();


  const {
    data: post,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["post", id, viewerId],
    queryFn: fetchPostAuthedAware,
    enabled: !!id && !loading,

  });

  const likeMutation = useMutation({
    mutationFn: () => likePost(id),


    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["post", id, viewerId] });
      const previous = queryClient.getQueryData(["post", id, viewerId]);

      if (previous) {
        queryClient.setQueryData(["post", id, viewerId], (old) => {
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
      if (ctx?.previous) {
        queryClient.setQueryData(["post", id, viewerId], ctx.previous);
      }
    },

    onSuccess: (data) => {

      queryClient.setQueryData(["post", id, viewerId], (old) => {
        if (!old) return old;
        return {
          ...old,
          likes: typeof data?.likes === "number" ? data.likes : old.likes,
          likedByMe:
              typeof data?.liked === "boolean" ? data.liked : old.likedByMe,
        };
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

  if (loading || isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading post. {error?.message}</p>;
  if (!post) return <p>Post not found.</p>;

  return (
      <div className="max-w-2xl mx-auto px-4 py-8 bg-white shadow rounded-lg">
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

        <h1 className="text-xl font-semibold mb-4">{post.description}</h1>

        {post.image && (
            <div className="mb-6">
              <img
                  src={post.image}
                  alt="Post"
                  className="rounded-lg w-full object-cover"
              />
            </div>
        )}


        {post.content && (
            <div
                className="prose prose-lg max-w-none mb-6"
                dangerouslySetInnerHTML={{ __html: post.content }}
            />
        )}

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

        <AddComment postId={id} />
        <div className="flex flex-col gap-4 mt-4">
          {post.comments?.length > 0 ? (
              post.comments.map((c) => <Comment key={c._id} comment={c} />)
          ) : (
              <p className="text-gray-500 mt-4">No comments yet.</p>
          )}
        </div>
      </div>
  );
};

export default SingelPostPage;
