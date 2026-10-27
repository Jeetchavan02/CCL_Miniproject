import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Registration failed.");
      }

      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border-2 border-black neo-box p-8">
        <h1 className="text-3xl font-bold text-black mb-1">Register</h1>
        <p className="text-gray-600 text-sm mb-6">
          Create your campus account.
        </p>

        {error && (
          <div className="border-2 border-red-600 bg-red-50 text-red-700 p-3 mb-6 text-sm neo-box font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block uppercase font-bold text-xs tracking-wider mb-2 text-black">
              NAME
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border-2 border-black rounded-none focus:outline-none focus:border-[#2563EB] bg-white font-medium"
              placeholder="Rahul Verma"
            />
          </div>

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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border-2 border-black rounded-none focus:outline-none focus:border-[#2563EB] bg-white font-medium"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block uppercase font-bold text-xs tracking-wider mb-2 text-black">
              ROLE
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 border-2 border-black rounded-none focus:outline-none focus:border-[#2563EB] bg-white font-medium"
            >
              <option value="student">Student</option>
              <option value="security">Security</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2563EB] text-white py-3 border-2 border-black neo-btn font-bold tracking-wide mt-2"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-gray-700">
          Already have an account?{" "}
          <Link to="/login" className="font-bold underline text-black hover:text-[#2563EB]">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
