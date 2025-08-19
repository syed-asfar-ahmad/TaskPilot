import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function BackButton() {
  const navigate = useNavigate();

  return (
    <div className="mt-4 ml-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 bg-white text-green-600 hover:bg-green-50 border border-green-200 px-4 py-2 rounded-lg shadow-sm transition"
      >
        <ArrowLeft size={18} />
        <span className="font-medium">Go Back</span>
      </button>
    </div>
  );
}

export default BackButton;
