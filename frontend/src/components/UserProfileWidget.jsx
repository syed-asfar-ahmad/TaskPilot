import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { getAvatarUrl } from "../utils/avatarUtils";

function UserProfileWidget() {
  const { user } = useAuth();

  if (!user) return null;

  const avatarUrl = getAvatarUrl(user.profilePicture, user.name, 32);

  return (
    <div className="absolute right-4 top-4 z-50 flex items-center gap-2">
      <Link
        to="/profile"
        className="flex items-center space-x-2 hover:underline text-sm text-gray-700"
      >
        <img
          src={avatarUrl}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover border border-gray-300"
        />
        <span className="font-medium">{user.name}</span>
      </Link>
    </div>
  );
}

export default UserProfileWidget;
