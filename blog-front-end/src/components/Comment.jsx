
import React from "react";
import ImageKit from "./ImageKit";
import { format } from "timeago.js";

const Comment = ({ comment }) => {
    return (
        <div className="flex items-start gap-3 border-b pb-3 mt-4">
            <ImageKit
                src={comment.imageOfUser}
                alt={comment.user}
                className="w-8 h-8 rounded-full object-cover "
            />
            <div className="flex flex-col">
                <span className="font-semibold text-blue-800">{comment.userName}</span>
                <span className="text-sm text-gray-600 mt-4">{comment.comment}</span>
                <span className="text-xs text-gray-400 mt-4">
          {comment.createdAt ? format(comment.createdAt) : ""}
        </span>
            </div>
        </div>
    );
};

export default Comment;
