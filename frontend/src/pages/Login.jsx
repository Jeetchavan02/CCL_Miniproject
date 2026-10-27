import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldIcon, UserIcon } from "../components/Icons";

export default function Login() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const [portalMode, setPortalMode] = useState("student"); // "student" | "security"
  const [email, setEmail] = useState("student@college.edu");
  const [password, setPassword] = useState("StudentPass123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePortalSwitch = (mode) => {
    setPortalMode(mode);
    setError("");
    if (mode === "student") {
      setEmail("student@college.edu");
      setPassword("StudentPass123!");
    } else {
      setEmail("officer@college.edu");
      setPassword("AdminPass123!");
    }
  };

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
      localStorage.setItem("email", email);

      // 2. Fetch user profile for role
      const meRes = await fetch(`${apiUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      const meData = await meRes.json();
      if (meRes.ok) {
        localStorage.setItem("role", meData.role);
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border-4 border-black neo-box overflow-hidden">
        {/* PORTAL SELECTION TABS */}
        <div className="grid grid-cols-2 border-b-4 border-black">
          <button
            type="button"
            onClick={() => handlePortalSwitch("student")}
            className={`py-3 px-4 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              portalMode === "student"
                ? "bg-[#2563EB] text-white"
                : "bg-gray-100 text-black hover:bg-gray-200"
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Student Portal</span>
          </button>

          <button
            type="button"
            onClick={() => handlePortalSwitch("security")}
            className={`py-3 px-4 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              portalMode === "security"
                ? "bg-[#FF9F1C] text-black"
                : "bg-gray-100 text-black hover:bg-gray-200"
            }`}
          >
            <ShieldIcon className="w-4 h-4" />
            <span>Security Desk</span>
          </button>
        </div>

        <div className="p-8">
          <div className="mb-6">
            <span
              className={`text-[10px] font-black uppercase px-2 py-0.5 border border-black ${
                portalMode === "security"
                  ? "bg-[#FF9F1C] text-black"
                  : "bg-[#2563EB] text-white"
              }`}
            >
              {portalMode === "security"
                ? "CAMPUS SECURITY AUTHENTICATION"
                : "COLLEGE STUDENT LOGIN"}
            </span>
            <h1 className="text-3xl font-black text-black mt-1">
              {portalMode === "security" ? "Officer Access" : "Student Login"}
            </h1>
            <p className="text-gray-600 text-xs mt-1">
              {portalMode === "security"
                ? "Custody verification, student claim inspection, and release authorization."
                : "Report missing items, upload found belongings, and track AI matches."}
            </p>
          </div>

          {error && (
            <div className="border-2 border-red-600 bg-red-50 text-red-700 p-3 mb-6 text-xs neo-box font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block uppercase font-bold text-xs tracking-wider mb-1.5 text-black">
                {portalMode === "security" ? "OFFICER EMAIL" : "STUDENT EMAIL"}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 border-2 border-black rounded-none focus:outline-none focus:border-[#2563EB] bg-white font-medium text-sm"
              />
            </div>

            <div>
              <label className="block uppercase font-bold text-xs tracking-wider mb-1.5 text-black">
                PASSWORD
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 border-2 border-black rounded-none focus:outline-none focus:border-[#2563EB] bg-white font-medium text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white py-3 border-2 border-black neo-btn font-black text-xs uppercase tracking-wider mt-2 ${
                portalMode === "security"
                  ? "bg-black text-white hover:bg-gray-800"
                  : "bg-[#2563EB] hover:bg-blue-700"
              }`}
            >
              {loading
                ? "Authenticating..."
                : portalMode === "security"
                ? "Sign In to Security Desk →"
                : "Sign In as Student →"}
            </button>
          </form>

          {portalMode === "student" && (
            <p className="text-xs text-center mt-6 text-gray-700 font-medium">
              New student on campus?{" "}
              <Link to="/register" className="font-bold underline text-[#2563EB]">
                Create an Account
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

