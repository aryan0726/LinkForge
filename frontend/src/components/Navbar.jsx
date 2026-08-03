import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
        
        <div>
          <h1 className="text-2xl font-bold text-orange-500">
            LinkForge
          </h1>
        </div>

        <div className="flex gap-8">
          <a href="#">Home</a>
          <a href="#">Features</a>
          <a href="#">Docs</a>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="font-medium"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="bg-orange-500 text-white px-5 py-2 rounded-lg"
          >
            Get Started
          </Link>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;