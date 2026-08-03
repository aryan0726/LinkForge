import { FaBell, FaSearch, FaPlus } from "react-icons/fa";

function Topbar({ onCreateLink }) {
  return (
    <div className="flex items-start justify-between">

      {/* Left Side */}

      <div>

        <h1 className="text-5xl font-bold text-gray-900">
          Welcome back, Aryan 👋
        </h1>

        <p className="text-gray-500 mt-2 text-lg">
          Here's what's happening with your links today.
        </p>

        <div className="flex gap-3 mt-5">

          <button
            onClick={onCreateLink}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl font-medium transition-all"
          >
            <FaPlus />
            Create Link
          </button>

          <button
            className="border border-gray-300 bg-white hover:bg-gray-50 px-5 py-3 rounded-xl font-medium transition-all"
          >
            Export Data
          </button>

        </div>

      </div>

      {/* Right Side */}

      <div className="flex items-center gap-4">

        {/* Search */}

        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">

          <FaSearch className="text-gray-400" />

          <input
            type="text"
            placeholder="Search links..."
            className="outline-none bg-transparent w-52"
          />

        </div>

        {/* Notification */}

        <button className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm hover:bg-gray-50 transition">

          <FaBell />

        </button>

        {/* Avatar */}

        <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center">
          A
        </div>

      </div>

    </div>
  );
}

export default Topbar;