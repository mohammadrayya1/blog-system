import { useParams } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { AxiosAuth } from "../components/Api/Axios";
import ImageKit from "../components/ImageKit";

const fetchUser = async (id) => (await AxiosAuth.get(`/account/${id}`)).data;
const fetchUserPosts = async (id) => (await AxiosAuth.get(`/posts?authorId=${id}`)).data;

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
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-8">
                {user?.avatar && (
                    <ImageKit src={user.avatar} alt={user.name || user.email} className="w-16 h-16 rounded-full object-cover" w="128" />
                )}
                <div>
                    <h1 className="text-2xl font-semibold">
                        {user?.name || user?.username || user?.email} ({username})
                    </h1>
                    {user?.bio && <p className="text-gray-600">{user.bio}</p>}
                </div>
            </div>

            <h2 className="text-xl font-semibold mb-4">Posts</h2>
            <div className="space-y-4">
                {Array.isArray(posts) && posts.length > 0 ? (
                    posts.map((post) => (
                        <a key={post.id} href={`/post/${post.id}`} className="block p-4 rounded-lg border hover:bg-gray-50">
                            <h3 className="font-semibold">{post.title || post.description}</h3>
                            {post.createdAt && (
                                <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
                            )}
                        </a>
                    ))
                ) : (
                    <p className="text-gray-500">No posts yet.</p>
                )}
            </div>
        </div>
    );
}
