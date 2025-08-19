import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import InLineLoader from "../components/InLineLoader";

const PrivateRoute = ({ children }) => {
  const { token, user, loading } = useAuth(); // include loading state

  // Still checking token or user info
  if (loading) {
    return <p className="text-center mt-10"><InLineLoader message="Loading User Information" /></p>;
  }

  // Not logged in
  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  // Logged in
  return children;
};

export default PrivateRoute;
