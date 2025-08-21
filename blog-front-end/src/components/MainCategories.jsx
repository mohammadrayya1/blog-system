import { Link, useSearchParams } from "react-router-dom";

const CATEGORIES = [
  { label: "All Posts", value: "" },
  { label: "Web Design", value: "web-design" },
  { label: "Development", value: "development" },
  { label: "Databases", value: "databases" },
  { label: "Search Engines", value: "seo" },
  { label: "Marketing", value: "marketing" },
];

const MainCategories = () => {
  const [sp] = useSearchParams();
  const current = sp.get("cat") || "";

  const linkClass = (isActive) =>
      [
        "rounded-full px-4 py-2",
        isActive ? "bg-blue-800 text-white" : "hover:bg-blue-50",
      ].join(" ");

  return (
      <div className="hidden md:flex bg-white rounded-3xl xl:rounded-full p-4 shadow-lg items-center justify-center gap-8">
        <div className="flex-1 flex items-center justify-between flex-wrap">
          {CATEGORIES.map(({ label, value }) => {
            const isActive = current === value;

            const search = value ? `?cat=${value}` : "";

            return (
                <Link
                    key={value || "all"}
                    to={{ search }}
                    className={linkClass(isActive)}
                    aria-current={isActive ? "page" : undefined}
                >
                  {label}
                </Link>
            );
          })}
        </div>
      </div>
  );
};

export default MainCategories;
