import { Navigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";

export default function Protected({ children }) {
    const { loading, isAuthenticated } = useAuth();
    if (loading) return <p>Loading...</p>;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return children;
}
