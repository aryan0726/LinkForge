import {
  FaLink,
  FaHome,
  FaChartBar,
  FaQrcode,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

function Sidebar() {
  return (
    <aside className="relative w-64 bg-white border-r border-gray-200 min-h-screen p-6">

      {/* Logo */}

      <div className="flex items-center gap-3 mb-12">
        <FaLink className="text-orange-500 text-3xl" />

        <h1 className="text-3xl font-bold">
          LinkForge
        </h1>
      </div>

      {/* Navigation */}

      <nav className="space-y-3">

        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-50 text-orange-500 font-medium">
          <FaHome />
          Dashboard
        </button>

        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100">
          <FaLink />
          My Links
        </button>

        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100">
          <FaChartBar />
          Analytics
        </button>

        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100">
          <FaQrcode />
          QR Studio
        </button>

        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100">
          <FaCog />
          Settings
        </button>

      </nav>

      {/* Upgrade Card */}

      <div className="mt-12 bg-orange-50 rounded-2xl p-5">
        <h3 className="font-semibold">
          Upgrade to Pro 🚀
        </h3>

        <p className="text-sm text-gray-600 mt-2">
          Unlock advanced analytics and premium features.
        </p>

        <button className="mt-4 w-full bg-orange-500 text-white py-2 rounded-lg">
          Upgrade
        </button>
      </div>

      {/* User */}

      <div className="absolute bottom-6 left-6 right-6">
        <button className="w-full flex items-center gap-3 border rounded-xl px-4 py-3 hover:bg-gray-50">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center font-semibold">
            A
          </div>

          <div className="text-left">
            <p className="font-medium">
              Aryan
            </p>

            <p className="text-sm text-gray-500">
              Free Plan
            </p>
          </div>

          <FaSignOutAlt className="ml-auto text-gray-500" />
        </button>
      </div>

    </aside>
  );
}

export default Sidebar;