import { useParams } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { AxiosAuth } from "../components/Api/Axios";
import ImageKit from "../components/ImageKit";

const fetchUser = async (id) => (await AxiosAuth.get(`/account/${id}`)).data;
const fetchUserPosts = async (accountId) => (await AxiosAuth.get(`/posts/${accountId}`)).data;

export default function ProfilePage() {
    const { username } = useParams();
    const { user: authUser } = useAuth();
    const id = authUser?.id ?? null;


    const { data: user, isLoading: uLoad, error: uErr } = useQuery({
        queryKey: ["user", id],
        queryFn: () => fetchUser(id),
        enabled: !!id,
    });

    const { data: posts, isLoading: pLoad, error: pErr } = useQuery({
        queryKey: ["userPosts", id],
        queryFn: () => fetchUserPosts(id),
        enabled: !!id,
    });

    if (uLoad || pLoad) return <p>Loading...</p>;
    if (uErr) return <p>Failed to load user.</p>;
    if (pErr) return <p>Failed to load posts.</p>;

    return (
        <>
        <h2 className="text-xl font-semibold mb-4">Posts</h2>
    <div className="space-y-4">
        {Array.isArray(user?.account?.posts) && user.account.posts.length > 0 ? (
            user.account.posts.map((post) => (

                <a
                    key={post.id}
                    href={`/${post.id}`}
                    className="block p-4 rounded-lg border hover:bg-gray-50"
                >
                    <h3 className="font-semibold">{post.content}</h3>

                    {post.likes !== undefined && (
                        <p className="text-sm text-gray-500">❤️ {post.likes} Likes</p>
                    )}
                </a>
            ))
        ) : (
            <p className="text-gray-500">No posts yet.</p>
        )}
    </div>
        </>
);
}
