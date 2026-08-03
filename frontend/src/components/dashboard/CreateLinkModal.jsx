import { useState } from "react";
import { FaTimes, FaLink } from "react-icons/fa";
import api from "../../services/api";

function CreateLinkModal({ isOpen, onClose, onSuccess }) {

  const [originalUrl, setOriginalUrl] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async () => {

    if (!originalUrl.trim()) {
      alert("Please enter a URL.");
      return;
    }

    try {

      setLoading(true);

      const response = await api.post("/links", {
        originalUrl,
      });

      alert("Short URL Created Successfully!");

      console.log(response.data);

      setOriginalUrl("");

      onClose();

      if (onSuccess) {
        onSuccess(response.data);
      }

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.message ||
        "Unable to create short URL."
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 relative">

        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-500 hover:text-red-500"
        >
          <FaTimes size={20} />
        </button>

        <h2 className="text-3xl font-bold mb-2">
          Create Short Link
        </h2>

        <p className="text-gray-500 mb-6">
          Paste your long URL below.
        </p>

        <label className="font-medium">
          Original URL
        </label>

        <div className="mt-2 flex items-center border rounded-xl px-4">

          <FaLink className="text-gray-400" />

          <input
            type="text"
            placeholder="https://example.com"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            className="w-full px-3 py-4 outline-none"
          />

        </div>

        <div className="flex justify-end gap-4 mt-8">

          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl border"
          >
            Cancel
          </button>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Link"}
          </button>

        </div>

      </div>

    </div>

  );
}

export default CreateLinkModal;