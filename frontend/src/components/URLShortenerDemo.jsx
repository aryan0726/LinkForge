import { useState } from "react";
import api from "../services/api";

function URLShortenerDemo() {
  const [longUrl, setLongUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleShorten = async () => {
    if (!longUrl.trim()) {
      alert("Please enter a URL");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/links", {
        originalUrl: longUrl,
      });

      setShortUrl(response.data.shortUrl);
    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        alert("Please login first.");
      } else {
        alert("Unable to create short URL.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shortUrl);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <section className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      <h2 className="text-3xl font-bold mb-6">
        Shorten Your URL
      </h2>

      <div className="space-y-4">

        <input
          type="text"
          placeholder="Paste your long URL..."
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3"
        />

        <input
          type="text"
          placeholder="Custom Alias (Coming Soon)"
          value={alias}
          disabled
          onChange={(e) => setAlias(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-100 cursor-not-allowed"
        />

        <button
          onClick={handleShorten}
          disabled={loading}
          className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {loading ? "Creating..." : "Shorten URL"}
        </button>

      </div>

      {shortUrl && (
        <div className="mt-6 p-5 bg-orange-50 border border-orange-200 rounded-xl">

          <p className="text-green-600 font-semibold">
            ✅ Short URL Generated
          </p>

          <a
            href={shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-orange-600 font-bold mt-3 break-all hover:underline"
          >
            {shortUrl}
          </a>

          <button
            onClick={handleCopy}
            className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>

        </div>
      )}
    </section>
  );
}

export default URLShortenerDemo;