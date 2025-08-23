import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "react-toastify";
import { useState } from "react";
import Image from "./Image";
import { useAuth } from "./AuthContext";
import {AxiosAuth} from "./Api/Axios.jsx";

const AddComment = ({ postId }) => {
    const { user } = useAuth();;
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    const [comment_text, setComment_text] = useState("");

    const mutation = useMutation({
        mutationFn: async (newComment) => {
            return await AxiosAuth.post(
                `addComment/${postId}`,
                newComment
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["post", postId] });
            setComment_text("");
            toast.success("Comment added successfully");
        },
        onError: (error) => {
            toast.error(error.response?.data || "Error adding comment");
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!comment_text.trim()) return;
        if (!user) {
            toast.error("You must be logged in to comment");
            return;
        }
        mutation.mutate({postId,comment_text,user: {
                id: user.id,
            }, });
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex items-start gap-4 mb-6 w-full mt-4"
        >
            {user?.imageUrl && (
                <Image
                    src={user.imageUrl}
                    className="w-10 h-10 rounded-full object-cover"
                    w="40"
                />
            )}
            <div className="flex-1 flex flex-col gap-2">
        <textarea
            name="desc"
            value={comment_text}
            onChange={(e) => setComment_text(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
        />
                <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="self-end bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                    {mutation.isPending ? "Sending..." : "Send"}
                </button>
            </div>
        </form>
    );
};

export default AddComment;
