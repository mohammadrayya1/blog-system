// PostList.jsx
import PostListItem from "./PostListItem.jsx";
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";
import { AxiosUser } from "./Api/Axios";

const fetchPosts = async ({ pageParam = 1, queryKey }) => {

    const [, { cat }] = queryKey;
    const qs = new URLSearchParams({ page: String(pageParam), limit: "10" });
    if (cat) qs.set("cat", cat);
    const res = await AxiosUser.get(`/posts?${qs.toString()}`);
    return res.data;
};

const PostList = ({ cat = "" }) => {
    const {
        data,
        error,
        isError,
        isLoading,
        fetchNextPage,
        hasNextPage,
    } = useInfiniteQuery({
        queryKey: ["posts", { cat }],
        queryFn: ({ pageParam = 1, queryKey }) => fetchPosts({ pageParam, queryKey }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) =>
            lastPage.hasMore ? lastPage.page + 1 : undefined,
    });

    if (isLoading) return "Loading...";
    if (isError) return `Something went wrong! ${error?.message ?? ""}`;

    const allPosts = data?.pages?.flatMap((p) => p.posts) || [];

    return (
        <InfiniteScroll
            dataLength={allPosts.length}
            next={fetchNextPage}
            hasMore={!!hasNextPage}
            loader={<h4>Loading more posts...</h4>}
            endMessage={<p><b>All posts loaded!</b></p>}
            scrollThreshold={0.9}
        >
            {allPosts.map((post) => (
                <PostListItem key={post.id} post={post} />
            ))}
        </InfiniteScroll>
    );
};

export default PostList;
