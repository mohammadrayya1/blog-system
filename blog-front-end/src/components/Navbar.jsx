import { useState } from "react";
import ImageKit from "./ImageKit";
import { Link } from "react-router";
import { useAuth } from "./AuthContext";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  return (
      <div className="w-full h-16 md:h-20 flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-4 text-2xl font-bold">
          <ImageKit
              className="w-8 h-8"
              src={"logo.png"}
              alt="Rayya Logo"
              w={32}
              h={32}
          />
          <span> Rayya Log</span>
        </Link>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <div
              className="cursor-pointer text-4xl"
              onClick={() => setOpen((prev) => !prev)}
          >
            {open ? "X" : "="}
          </div>
          <div
              className={`main w-full h-screen flex flex-col items-center justify-center absolute top-16 transition-all ease-in-out ${
                  open ? "-right-0" : "-right-[100%]"
              }`}
          >
            <Link to="/">Home</Link>
            <Link to="/">Trending</Link>
            <Link to="/">Most popular</Link>
            <Link to="/">About</Link>

            {isAuthenticated ? (
                <div className="flex items-center gap-4 mt-4">
              <span className="text-gray-700">
                👤 {user?.name || user?.email}
              </span>
                  <button
                      onClick={logout}
                      className="py-2 px-4 rounded-3xl bg-red-600 text-white"
                  >
                    Logout
                  </button>
                </div>
            ) : (
                <Link to="/login" className="mt-4">
                  <button className="py-2 px-4 rounded-3xl bg-blue-800 text-white">
                    Login
                  </button>
                </Link>
            )}
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 xl:gap-12 font-medium">
          <a href="/">Home</a>
          <a href="">Trending</a>
          <a href="">Most popular</a>
          <a href="">About</a>

          {isAuthenticated ? (
              <div className="flex items-center gap-4">
            <span className="text-gray-700">
              👤 {user?.name || user?.email}
            </span>
                <button
                    onClick={logout}
                    className="py-2 px-4 rounded-3xl bg-red-600 text-white"
                >
                  Logout
                </button>
              </div>
          ) : (
              <Link to="/login">
                <button className="py-2 px-4 rounded-3xl bg-blue-800 text-white">
                  Login
                </button>
              </Link>
          )}
        </div>
      </div>
  );
};

export default Navbar;
