import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="bg-black border-b-4 border-[#2563EB] px-6 py-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo */}
        <Link to={token ? "/matches" : "/login"} className="text-[#00C2FF] font-bold text-xl tracking-tight flex items-center gap-2">
          <span>🔍</span> LostFound@CRCE
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center flex-wrap gap-4 font-bold text-sm tracking-wide">
          {!token ? (
            <>
              <Link
                to="/login"
                className="text-white hover:text-[#00C2FF] transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-[#2563EB] text-white px-4 py-2 border-2 border-white neo-btn"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/lost/new"
                className="text-white hover:text-[#00C2FF] transition-colors"
              >
                Report Lost
              </Link>
              <Link
                to="/found/new"
                className="text-white hover:text-[#00C2FF] transition-colors"
              >
                Report Found
              </Link>
              <Link
                to="/matches"
                className="text-white hover:text-[#00C2FF] transition-colors"
              >
                My Matches
              </Link>

              {role === "security" && (
                <Link
                  to="/claims"
                  className="text-[#FFD60A] hover:text-white transition-colors"
                >
                  Claims
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-3 py-1.5 border-2 border-white neo-btn"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
