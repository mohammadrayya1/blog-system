import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import { AuthProvider } from "./components/AuthContext.jsx";
import HomePage from "./routes/HomePage.jsx";
import PostListPage from "./routes/PostListPage.jsx";
import Write from "./routes/Write.jsx";
import ProfilePage from "./routes/ProfilePage.jsx"
import  Protected from "./components/Protected.jsx"
import RegisterPage from "./routes/RegisterPage.jsx";
import LoginPage from "./routes/LoginPage.jsx";
import SingelPostPage from "./routes/SingelPostPage.jsx";
import MainLayout from "./layOuts/MainLayout.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/posts",
        element: <PostListPage />,
      },
      {
        path: "/:id",
        element: <SingelPostPage />,
      },
      {
        path: "/write",
        element: (
            <Protected>
          <Write />
        </Protected>
        )
      },
      { path: "/profile/:username", element: (
            <Protected>
              <ProfilePage />
            </Protected>
        ) },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
    ],
  },
]);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <AuthProvider>

        <QueryClientProvider client={queryClient}>
          <ToastContainer position="top-right" autoClose={3000} />
          <RouterProvider router={router} />
        </QueryClientProvider>
      </AuthProvider>
    </ClerkProvider>
  </StrictMode>
);
