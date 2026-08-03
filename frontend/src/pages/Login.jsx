import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaLink,
  FaEnvelope,
  FaLock,
  FaChartBar,
  FaShieldAlt,
} from "react-icons/fa";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);

      alert("Login Successful!");

      navigate("/dashboard");
    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        alert("Invalid email or password.");
      } else {
        alert("Login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* LEFT SIDE */}

      <div className="hidden lg:flex flex-col justify-center bg-orange-50 px-16">

        <div className="max-w-lg">

          <div className="flex items-center gap-3 mb-10">
            <FaLink className="text-orange-500 text-3xl" />
            <h1 className="text-3xl font-bold">
              LinkForge
            </h1>
          </div>

          <h2 className="text-6xl font-bold leading-tight">
            Welcome back!
          </h2>

          <h2 className="text-6xl font-bold mt-2">
            Glad to
            <span className="text-orange-500">
              {" "}see you again 👋
            </span>
          </h2>

          <p className="mt-8 text-gray-600 text-lg">
            Log in to your account and continue
            shortening, tracking and analyzing links.
          </p>

          <div className="mt-12 space-y-6">

            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <FaChartBar className="text-orange-500 text-2xl" />

                <div>
                  <h3 className="font-semibold">
                    Real-Time Analytics
                  </h3>

                  <p className="text-gray-500 text-sm">
                    Track clicks and audience insights.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <FaLink className="text-orange-500 text-2xl" />

                <div>
                  <h3 className="font-semibold">
                    Smart Short Links
                  </h3>

                  <p className="text-gray-500 text-sm">
                    Create custom branded URLs instantly.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <FaShieldAlt className="text-orange-500 text-2xl" />

                <div>
                  <h3 className="font-semibold">
                    Secure & Reliable
                  </h3>

                  <p className="text-gray-500 text-sm">
                    Enterprise-grade protection.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* RIGHT SIDE */}

      <div className="flex items-center justify-center px-6 py-12 bg-white">

        <div className="w-full max-w-lg bg-white border border-gray-200 rounded-3xl p-10 shadow-lg">

          <h2 className="text-4xl font-bold">
            Log in to LinkForge
          </h2>

          <p className="text-gray-500 mt-3">
            Enter your details to access your account
          </p>

          <div className="mt-8">

            <label className="font-medium">
              Email Address
            </label>

            <div className="mt-2 flex items-center border rounded-xl px-4">
              <FaEnvelope className="text-gray-400" />

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-4 outline-none"
              />
            </div>

          </div>

          <div className="mt-6">

            <label className="font-medium">
              Password
            </label>

            <div className="mt-2 flex items-center border rounded-xl px-4">
              <FaLock className="text-gray-400" />

              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-4 outline-none"
              />
            </div>

          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full mt-8 bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-200 text-white py-4 rounded-xl font-semibold transition disabled:opacity-50"
          >
            {loading ? "Logging In..." : "Log In"}
          </button>

          <p className="text-center mt-6 text-gray-500">
            Don't have an account?
            <span
              onClick={() => navigate("/register")}
              className="text-orange-500 font-medium cursor-pointer"
            >
              {" "}Sign Up
            </span>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;