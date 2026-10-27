import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    setMenuOpen(false);
    navigate("/login");
  };

  // Back button rules: show on /lost/new, /found/new, /claims; hide on /login, /register, /matches
  const hideBackRoutes = ["/login", "/register", "/matches", "/"];
  const showBack = !hideBackRoutes.includes(location.pathname);

  return (
    <nav className="bg-black border-b-2 border-[#2563EB] relative z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* LEFT: Back button + Logo */}
        <div className="flex items-center gap-4">
          {showBack ? (
            <button
              onClick={() => window.history.back()}
              className="text-white font-bold hover:text-[#00C2FF] flex items-center gap-1 transition-colors text-sm"
              title="Go back"
            >
              ← Back
            </button>
          ) : (
            <div className="w-0" />
          )}

          <Link
            to={token ? "/matches" : "/login"}
            className="text-[#00C2FF] font-bold text-xl tracking-tight flex items-center gap-2"
          >
            <span>🔍</span> LostFound@CRCE
          </Link>
        </div>

        {/* CENTER: Empty spacer */}
        <div className="hidden md:block flex-1" />

        {/* RIGHT: Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-6 font-bold text-sm tracking-wide">
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

        {/* Mobile Hamburger Button */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white text-2xl font-bold p-1 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden bg-black border-t border-[#2563EB] flex flex-col font-bold text-sm tracking-wide">
          {!token ? (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="py-3 px-6 text-white hover:bg-gray-900 border-b border-gray-800"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="py-3 px-6 text-[#00C2FF] hover:bg-gray-900"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/lost/new"
                onClick={() => setMenuOpen(false)}
                className="py-3 px-6 text-white hover:bg-gray-900 border-b border-gray-800"
              >
                Report Lost
              </Link>
              <Link
                to="/found/new"
                onClick={() => setMenuOpen(false)}
                className="py-3 px-6 text-white hover:bg-gray-900 border-b border-gray-800"
              >
                Report Found
              </Link>
              <Link
                to="/matches"
                onClick={() => setMenuOpen(false)}
                className="py-3 px-6 text-white hover:bg-gray-900 border-b border-gray-800"
              >
                My Matches
              </Link>
              {role === "security" && (
                <Link
                  to="/claims"
                  onClick={() => setMenuOpen(false)}
                  className="py-3 px-6 text-[#FFD60A] hover:bg-gray-900 border-b border-gray-800"
                >
                  Claims
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-left py-3 px-6 text-red-400 hover:bg-gray-900"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
