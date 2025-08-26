import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { getAvatarUrl } from "../utils/avatarUtils";

function UserProfileWidget() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="absolute right-4 top-4 z-50 flex items-center gap-2">
      <Link
        to="/profile"
        className="flex items-center space-x-2 hover:underline text-sm text-gray-700"
      >
        {user.profilePicture ? (
          <img
            src={user.profilePicture}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover border border-gray-300"
          />
        ) : (
          <div className="w-8 h-8 rounded-full border border-gray-300 bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
            </span>
          </div>
        )}
        <span className="font-medium">{user.name}</span>
      </Link>
    </div>
  );
}

export default UserProfileWidget;
