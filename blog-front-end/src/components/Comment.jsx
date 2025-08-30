import React, { useState } from "react";
import ImageKit from "./ImageKit";
import { format } from "timeago.js";
import { useAuth } from "./AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosAuth } from "./Api/Axios";

// حذف كومنت
const deleteComment = async ({ postId, commentId, accountId }) => {
    const res = await AxiosAuth.delete(`/comment/${accountId}/${postId}/${commentId}`);
    return res.data;
};

// تعديل كومنت
const editComment = async ({ postId, commentId, accountId, newComment }) => {
    const res = await AxiosAuth.put(`/comment/${accountId}/${postId}/${commentId}`, {
        comment: newComment,
    });
    return res.data;
};

const Comment = ({ comment, postId, setMessage }) => {
    const { isAuthenticated, user: authUser } = useAuth();
    const queryClient = useQueryClient();

    // 🔹 state محلي للتعديل
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(comment.comment);

    // mutation للحذف
    const deleteMutation = useMutation({
        mutationFn: () =>
            deleteComment({
                postId,
                commentId: comment.id,
                accountId: comment.accountId,
            }),
        onSuccess: (data) => {
            setMessage(data.message || "Comment deleted successfully ✅");
            setTimeout(() => setMessage(""), 3000);
            queryClient.invalidateQueries(["post", postId, authUser?.id ?? null]);
        },
    });

    // mutation للتعديل
    const editMutation = useMutation({
        mutationFn: () =>
            editComment({
                postId,
                commentId: comment.id,
                accountId: comment.accountId,
                newComment: editValue,
            }),
        onSuccess: (data) => {
            setMessage(data.message || "Comment updated successfully ✅");
            setTimeout(() => setMessage(""), 3000);
            setIsEditing(false);
            queryClient.invalidateQueries(["post", postId, authUser?.id ?? null]);
        },
    });

    const handleDelete = () => {
        if (window.confirm("Do you want to delete the comment?")) {
            deleteMutation.mutate();
        }
    };

    const handleEdit = () => {
        if (editValue.trim() === "") {
            alert("Comment cannot be empty!");
            return;
        }
        editMutation.mutate();
    };

    return (
        <div className="flex items-start gap-3 border-b pb-3 mt-4">
            <ImageKit
                src={comment.imageOfUser}
                alt={comment.user}
                className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex flex-col flex-1">
                <span className="font-semibold text-blue-800">{comment.userName}</span>

                {isEditing ? (
                    <div className="flex gap-2 mt-2">
                        <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 border rounded px-2 py-1 text-sm"
                        />
                        <button
                            onClick={handleEdit}
                            disabled={editMutation.isPending}
                            className="text-green-600 hover:text-green-800"
                        >
                            💾
                        </button>
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setEditValue(comment.comment); // رجع القيمة القديمة
                            }}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ❌
                        </button>
                    </div>
                ) : (
                    <span className="text-sm text-gray-600 mt-2">{comment.comment}</span>
                )}

                <span className="text-xs text-gray-400 mt-2">
          {comment.createdAt ? format(comment.createdAt) : ""}
        </span>
            </div>

            {isAuthenticated && authUser?.id === comment.accountId && (
                <div className="flex flex-col gap-1 ml-2">

                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-blue-500 hover:text-blue-700"
                            title="Edit Comment"
                        >
                            ✏️
                        </button>
                    )}


                    <button
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                        className="text-red-500 hover:text-red-700"
                        title="Delete Comment"
                    >
                        🗑️
                    </button>
                </div>
            )}
        </div>
    );
};

export default Comment;
