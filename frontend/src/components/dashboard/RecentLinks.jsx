import { useEffect, useState } from "react";
import {
  FaCopy,
  FaChartBar,
  FaTrash,
} from "react-icons/fa";
import api from "../../services/api";

function RecentLinks({ onCreateLink, refresh }) {

  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLinks = async () => {

    try {

      const response = await api.get("/links");

      setLinks(response.data);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {
    fetchLinks();
}, [refresh]);

  const handleCopy = async (text) => {

    try {

  await navigator.clipboard.writeText(text);

  alert("Short URL copied!");

} catch {

  alert("Copy failed.");

}

  };

  const handleDelete = async (shortCode) => {

  const confirmDelete = window.confirm(
    "Are you sure you want to delete this link?"
  );

  if (!confirmDelete) return;

  try {

    await api.delete(`/links/${shortCode}`);

    setLinks((prevLinks) =>
      prevLinks.filter(
        (link) => link.shortCode !== shortCode
      )
    );

    alert("Link deleted successfully!");

  } catch (error) {

    console.error(error);

    alert("Failed to delete link.");

  }

};

  return (

    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mt-8">

      <div className="flex items-center justify-between mb-6">

        <h2 className="text-2xl font-bold">
          Recent Links
        </h2>

        <button
          onClick={onCreateLink}
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg transition"
        >
          + New Link
        </button>

      </div>

      {loading ? (

        <div className="py-10 text-center text-gray-500">
          Loading links...
        </div>

      ) : links.length === 0 ? (

        <div className="py-10 text-center text-gray-500">
          No links found.
        </div>

      ) : (

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="text-left text-gray-500 border-b">

                <th className="pb-4">Original URL</th>
                <th className="pb-4">Short URL</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Clicks</th>
                <th className="pb-4">Actions</th>

              </tr>

            </thead>

            <tbody>

              {links.map((link, index) => (

                <tr
                  key={index}
                  className="hover:bg-orange-50 transition"
                >

                  <td className="py-5 break-all">
                    {link.originalUrl}
                  </td>

                  <td className="py-5">

                    <a
                      href={link.shortUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-orange-500 font-medium hover:underline"
                    >
                      {link.shortCode}
                    </a>

                  </td>

                  <td className="py-5">

                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                      Active
                    </span>

                  </td>

                  <td className="py-5 font-medium">

                    {link.clickCount}

                  </td>

                  <td className="py-5">

                    <div className="flex items-center gap-3">

                      <button
                        onClick={() => handleCopy(link.shortUrl)}
                        className="p-2 rounded-lg hover:bg-gray-100"
                      >
                        <FaCopy />
                      </button>

                      <button className="p-2 rounded-lg hover:bg-gray-100 text-blue-600">
                        <FaChartBar />
                      </button>

                      <button
                        onClick={() => handleDelete(link.shortCode)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-red-500">
                          <FaTrash />
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>

  );
}

export default RecentLinks;