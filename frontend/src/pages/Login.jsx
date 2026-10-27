import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Authenticate and obtain JWT
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Invalid login credentials.");
      }

      localStorage.setItem("token", data.access_token);

      // 2. Fetch user profile for role
      const meRes = await fetch(`${apiUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      const meData = await meRes.json();
      if (meRes.ok) {
        localStorage.setItem("role", meData.role);
      }

      navigate("/matches");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border-2 border-black neo-box p-8">
        <h1 className="text-3xl font-bold text-black mb-1">Login</h1>
        <p className="text-gray-600 text-sm mb-6">
          Sign in to report items and view your matches.
        </p>

        {error && (
          <div className="border-2 border-red-600 bg-red-50 text-red-700 p-3 mb-6 text-sm neo-box font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block uppercase font-bold text-xs tracking-wider mb-2 text-black">
              EMAIL
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border-2 border-black rounded-none focus:outline-none focus:border-[#2563EB] bg-white font-medium"
              placeholder="student@college.edu"
            />
          </div>

          <div>
            <label className="block uppercase font-bold text-xs tracking-wider mb-2 text-black">
              PASSWORD
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border-2 border-black rounded-none focus:outline-none focus:border-[#2563EB] bg-white font-medium"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2563EB] text-white py-3 border-2 border-black neo-btn font-bold tracking-wide"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-gray-700">
          No account yet?{" "}
          <Link to="/register" className="font-bold underline text-black hover:text-[#2563EB]">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
