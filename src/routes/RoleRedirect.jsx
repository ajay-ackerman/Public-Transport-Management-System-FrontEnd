import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RoleRedirect = () => {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;

    switch (user.role) {
        case "ADMIN":
            return <Navigate to="/admin" replace />;
        case "DRIVER":
            return <Navigate to="/driver" replace />;
        case "PASSENGER":
            return <Navigate to="/passenger" replace />;
        default:
            return <Navigate to="/unauthorized" replace />;
    }
};

export default RoleRedirect;