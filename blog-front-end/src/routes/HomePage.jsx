import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { AxiosAuth } from "../components/Api/Axios";
import MainCategories from "../components/MainCategories";
import PostList from "../components/PostList.jsx";

const LABELS = {
  "web-design": "Web Design",
  "development": "Development",
  "databases": "Databases",
  "seo": "Search Engines",
  "marketing": "Marketing",
};

const HomePage = () => {
  const [sp, setSp] = useSearchParams();
  const cat = sp.get("cat") || "";
  const q = sp.get("q") || "";

  const [searchData, setSearchData] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    if (!q) {
      setSearchData(null);
      setSearchError("");
      setSearchLoading(false);
      return;
    }
    const controller = new AbortController();
    const run = async () => {
      try {
        setSearchLoading(true);
        setSearchError("");
        const params = { q, from: 0, size: 20 };
        if (cat && LABELS[cat]) params.category = LABELS[cat];
        const { data } = await AxiosAuth.get("/postssearch/search", {
          params,
          signal: controller.signal,
        });
        setSearchData(data);
      } catch (err) {
        if (err?.name !== "CanceledError") {
          setSearchError(err?.message || "Search failed");
        }
      } finally {
        setSearchLoading(false);
      }
    };
    run();
    return () => controller.abort();
  }, [q, cat]);

  const onSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const nextQ = (form.get("q") || "").toString().trim();
    const next = new URLSearchParams(sp);
    if (nextQ) next.set("q", nextQ);
    else next.delete("q");
    setSp(next, { replace: false });
  };

  const heading = q
      ? `Results for "${q}"`
      : cat
          ? `${LABELS[cat] ?? cat} Posts`
          : "Recent Posts";

  return (
      <div className="mt-4 flex flex-col gap-4">
        <div className="flex gap-4">
          <Link to="/">Home</Link>
          <span>•</span>
          <span className="text-blue-800">Blogs and Articles</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-800 text-2xl md:text-5xl lg:text-6xl font-bold">
              Welcome to the Blog
            </h1>
            <p className="mt-8 text-md md:text-xl">
              Search and explore posts by category or keywords.
            </p>
            <form onSubmit={onSubmit} className="mt-6 flex gap-2">
              <input
                  name="q"
                  defaultValue={q}
                  placeholder="Search posts..."
                  className="border rounded-lg px-3 py-2 w-72"
              />
              <button className="px-4 py-2 rounded-lg bg-blue-800 text-white">
                Search
              </button>
            </form>
          </div>
        </div>
        <MainCategories />
        <div>
          <h1 className="my-8 text-2xl text-gray-600">{heading}</h1>
          {q ? (
              <>
                {searchLoading && <div>Searching...</div>}
                {searchError && (
                    <div className="text-red-600">Error: {searchError}</div>
                )}
                {!searchLoading && !searchError && (
                    <>
                      <div className="text-sm text-gray-500 mb-3">
                        {searchData?.total ?? 0} result(s)
                      </div>
                      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {(searchData?.data ?? []).map((item) => (
                            <li
                                key={item.id}
                                className="border rounded-lg p-3 flex gap-3 hover:shadow-md"
                            >
                              <Link to={`/${item.id}`} className="flex gap-3 w-full">
                                {item.image && (
                                    <img
                                        src={item.image}
                                        alt=""
                                        className="w-24 h-24 object-cover rounded"
                                    />
                                )}
                                <div className="flex-1">
                                  <div className="text-sm text-gray-500">
                                    {item.category} •{" "}
                                    {item.createdAt
                                        ? new Date(item.createdAt).toLocaleDateString()
                                        : ""}
                                  </div>
                                  {item.snippet ? (
                                      <div
                                          className="mt-1"
                                          dangerouslySetInnerHTML={{ __html: item.snippet }}
                                      />
                                  ) : (
                                      <div className="mt-1 text-gray-700 line-clamp-2"></div>
                                  )}
                                  <div className="mt-2 text-xs text-gray-500">
                                    👍 {item.likes} • 💬 {item.comments} • ⚖️ {item.score}
                                  </div>
                                </div>
                              </Link>
                            </li>
                        ))}
                      </ul>
                    </>
                )}
              </>
          ) : (
              <PostList cat={cat} key={cat} />
          )}
        </div>
      </div>
  );
};

export default HomePage;
