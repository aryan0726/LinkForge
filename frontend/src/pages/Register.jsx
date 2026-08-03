import React, { useState } from "react";
import {
  FaLink,
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaChartBar,
  FaShieldAlt,
  FaRocket,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {

    if (
      !fullName ||
      !username ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      alert("Please fill all fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {

      setLoading(true);

      await api.post("/auth/register", {
        fullName,
        username,
        email,
        password,
      });

      alert("Registration Successful!");

      navigate("/login");

    } catch (error) {

  console.error("Registration Error:", error);
  console.log(error.response);
  console.log(error.response?.data);

  alert(
    error.response?.data?.message ||
    JSON.stringify(error.response?.data) ||
    "Registration failed."
  );

}  finally {

      setLoading(false);

    }

  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* LEFT SIDE */}

      <div className="hidden lg:flex flex-col justify-center bg-orange-50 px-16 py-12 lg:w-1/2">
        <div className="max-w-xl">

          <div className="flex items-center gap-3 mb-10">
            <FaLink className="text-orange-500 text-3xl" />

            <h1 className="text-4xl font-bold">
              LinkForge
            </h1>
          </div>

          <h2 className="text-6xl font-bold leading-tight text-gray-900">
            Create your
          </h2>

          <h2 className="text-6xl font-bold text-gray-900">
            LinkForge Account
          </h2>

          <h3 className="text-5xl font-bold text-orange-500 mt-4">
            Start growing faster.
          </h3>

          <p className="mt-8 text-lg text-gray-600 leading-relaxed">
            Join creators, developers and businesses using
            LinkForge to shorten links, track clicks and
            grow their audience.
          </p>

          <div className="grid grid-cols-2 gap-5 mt-12">

            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <FaLink className="text-orange-500 text-2xl mb-3" />
              <h4 className="font-semibold">Smart Links</h4>
              <p className="text-sm text-gray-500 mt-2">
                Create branded URLs instantly.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <FaChartBar className="text-orange-500 text-2xl mb-3" />
              <h4 className="font-semibold">Analytics</h4>
              <p className="text-sm text-gray-500 mt-2">
                Track clicks in real time.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <FaShieldAlt className="text-orange-500 text-2xl mb-3" />
              <h4 className="font-semibold">Secure</h4>
              <p className="text-sm text-gray-500 mt-2">
                Enterprise-grade protection.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <FaRocket className="text-orange-500 text-2xl mb-3" />
              <h4 className="font-semibold">Fast Setup</h4>
              <p className="text-sm text-gray-500 mt-2">
                Ready in minutes.
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* RIGHT SIDE */}

      <div className="flex items-center justify-center px-6 py-12 lg:w-1/2 bg-white">

        <div className="w-full max-w-lg bg-white border border-gray-200 rounded-3xl p-10 shadow-lg">

          <div className="flex justify-end mb-6">
            <p className="text-gray-500">
              Already have an account?

              <Link
                to="/login"
                className="text-orange-500 font-medium ml-1 hover:underline"
              >
                Log In
              </Link>

            </p>
          </div>

          <h2 className="text-4xl font-bold">
            Create Account
          </h2>

          <p className="text-gray-500 mt-3">
            Start managing smart links today.
          </p>

          <div className="mt-8 space-y-5">

  {/* Full Name */}

  <div>
    <label className="font-medium">
      Full Name
    </label>

    <div className="mt-2 flex items-center border rounded-xl px-4">
      <FaUser className="text-gray-400" />

      <input
        type="text"
        placeholder="Enter your full name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="w-full px-3 py-4 outline-none"
      />
    </div>
  </div>

  {/* Username */}

<div>
  <label className="font-medium">
    Username
  </label>

  <div className="mt-2 flex items-center border rounded-xl px-4">
    <FaUser className="text-gray-400" />

    <input
      type="text"
      placeholder="Choose a username"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      className="w-full px-3 py-4 outline-none"
    />
  </div>
</div>

  {/* Email */}

  <div>
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

  {/* Password */}

  <div>
    <label className="font-medium">
      Password
    </label>

    <div className="mt-2 flex items-center border rounded-xl px-4">
      <FaLock className="text-gray-400" />

      <input
        type={showPassword ? "text" : "password"}
        placeholder="Create password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-3 py-4 outline-none"
      />

      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
  </div>

  {/* Confirm Password */}

  <div>
    <label className="font-medium">
      Confirm Password
    </label>

    <div className="mt-2 flex items-center border rounded-xl px-4">
      <FaLock className="text-gray-400" />

      <input
        type={showConfirmPassword ? "text" : "password"}
        placeholder="Confirm password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="w-full px-3 py-4 outline-none"
      />

      <button
        type="button"
        onClick={() =>
          setShowConfirmPassword(!showConfirmPassword)
        }
      >
        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
  </div>

  {/* Button */}

  <button
    onClick={handleRegister}
    disabled={loading}
    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-semibold shadow-lg shadow-orange-200 transition disabled:opacity-50"
  >
    {loading ? "Creating Account..." : "Create Free Account"}
  </button>

  {/* Footer */}

  <div className="bg-orange-50 rounded-xl p-4 mt-4">
    <div className="flex items-start gap-3">
      <FaShieldAlt className="text-orange-500 text-xl mt-1" />

      <div>
        <p className="font-semibold">
          Your data is secure
        </p>

        <p className="text-sm text-gray-500 mt-1">
          We protect your information with
          industry-standard security.
        </p>
      </div>
    </div>
  </div>

</div>
        </div>
      </div>
    </div>
  );
}

export default Register;