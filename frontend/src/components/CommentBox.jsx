import { useState } from "react";
import axios from "axios";
import { toast } from 'react-hot-toast';

const API = process.env.REACT_APP_API_BASE_URL || 'https://taskpilot-1-mzxb.onrender.com/api';

function CommentBox({ token, projectId, onCommentAdded }) {
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await axios.post(
        `${API}/projects/${projectId}/comments`,
        { text: commentText },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Comment posted");
      setCommentText("");
      onCommentAdded(); 
    } catch (err) {
      toast.error("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <textarea
        className="w-full p-2 border rounded"
        placeholder="Add a comment..."
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        disabled={isSubmitting}
      />
      <button
        type="submit"
        disabled={isSubmitting || !commentText.trim()}
        className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Posting..." : "Post Comment"}
      </button>
    </form>
  );
}

export default CommentBox;
