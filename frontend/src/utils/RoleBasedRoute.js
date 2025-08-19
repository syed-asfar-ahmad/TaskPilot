import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import InLineLoader from "../components/InLineLoader";

const RoleBasedRoute = ({ allowedRoles, children }) => {
  const { token, user, loading } = useAuth();

  if (loading) {
    return <p className="text-center mt-10"><InLineLoader message="Loading User Information" /></p>;
  }

  if (!token || !user) return <Navigate to="/login" />;

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default RoleBasedRoute;
