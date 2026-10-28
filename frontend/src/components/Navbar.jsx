import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  SearchIcon,
  AlertIcon,
  CameraIcon,
  ChartIcon,
  LightningIcon,
  ShieldIcon,
  CheckIcon,
} from "./Icons";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role") || "student";
  const userEmail = localStorage.getItem("email") || "";
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    setMenuOpen(false);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-black border-b-4 border-[#2563EB] sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* LEFT: Brand Logo */}
        <div className="flex items-center gap-3">
          <Link
            to={token ? "/dashboard" : "/"}
            className="text-[#00C2FF] font-black text-xl tracking-tight flex items-center gap-2 hover:opacity-90"
          >
            <SearchIcon className="w-6 h-6 text-[#00C2FF]" />
            <span className="text-white">Lost<span className="text-[#00C2FF]">&</span>Found</span>
            <span className="bg-[#2563EB] text-white text-[10px] uppercase font-black px-1.5 py-0.5 rounded-none border border-white">
              CRCE
            </span>
          </Link>
        </div>

        {/* CENTER: Direct One-Click Navigation Pills */}
        <div className="hidden lg:flex items-center gap-2">
          <Link
            to="/dashboard"
            className={`px-3 py-1.5 text-xs uppercase font-black tracking-wider border-2 flex items-center gap-1.5 transition-all ${
              isActive("/dashboard") || isActive("/")
                ? "bg-[#00FF85] text-black border-black shadow-[2px_2px_0px_rgba(255,255,255,1)]"
                : "bg-transparent text-white border-transparent hover:border-white"
            }`}
          >
            <ChartIcon className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>

          {token && (
            <>
              <Link
                to="/lost/new"
                className={`px-3 py-1.5 text-xs uppercase font-black tracking-wider border-2 flex items-center gap-1.5 transition-all ${
                  isActive("/lost/new")
                    ? "bg-[#FF5555] text-white border-white shadow-[2px_2px_0px_rgba(255,255,255,1)]"
                    : "bg-transparent text-white border-transparent hover:border-white"
                }`}
              >
                <AlertIcon className="w-3.5 h-3.5" />
                <span>Report Lost</span>
              </Link>

              <Link
                to="/found/new"
                className={`px-3 py-1.5 text-xs uppercase font-black tracking-wider border-2 flex items-center gap-1.5 transition-all ${
                  isActive("/found/new")
                    ? "bg-[#00C2FF] text-black border-black shadow-[2px_2px_0px_rgba(255,255,255,1)]"
                    : "bg-transparent text-white border-transparent hover:border-white"
                }`}
              >
                <CameraIcon className="w-3.5 h-3.5" />
                <span>Report Found</span>
              </Link>

              <Link
                to="/matches"
                className={`px-3 py-1.5 text-xs uppercase font-black tracking-wider border-2 flex items-center gap-1.5 transition-all ${
                  isActive("/matches")
                    ? "bg-[#FFD60A] text-black border-black shadow-[2px_2px_0px_rgba(255,255,255,1)]"
                    : "bg-transparent text-white border-transparent hover:border-white"
                }`}
              >
                <LightningIcon className="w-3.5 h-3.5" />
                <span>AI Matches</span>
              </Link>

              <Link
                to="/claims"
                className={`px-3 py-1.5 text-xs uppercase font-black tracking-wider border-2 flex items-center gap-1.5 transition-all ${
                  isActive("/claims")
                    ? "bg-[#FF9F1C] text-black border-black shadow-[2px_2px_0px_rgba(255,255,255,1)]"
                    : "bg-transparent text-[#FFD60A] border-transparent hover:border-[#FFD60A]"
                }`}
              >
                {role === "security" ? (
                  <>
                    <ShieldIcon className="w-3.5 h-3.5" />
                    <span>Security Handover Desk</span>
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-3.5 h-3.5" />
                    <span>Claims & Handover</span>
                  </>
                )}
              </Link>
            </>
          )}
        </div>



        {/* RIGHT: User Badge & Actions */}
        <div className="hidden lg:flex items-center gap-3">
          {!token ? (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-white hover:text-[#00C2FF] font-bold text-xs uppercase px-3 py-1.5"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-[#2563EB] text-white px-4 py-1.5 border-2 border-white neo-btn font-bold text-xs uppercase tracking-wider"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 border border-gray-700 bg-gray-900 px-2.5 py-1 text-xs">
                <span
                  className={`w-2 h-2 rounded-full ${
                    role === "security" ? "bg-amber-400" : "bg-emerald-400"
                  }`}
                />
                <span className="text-gray-300 font-medium text-[11px] truncate max-w-[130px]">
                  {userEmail.split("@")[0] || "User"}
                </span>
                <span className="bg-black text-[9px] uppercase font-black text-gray-300 px-1.5 py-0.5 border border-gray-700">
                  {role}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 border border-white text-xs font-bold uppercase transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="lg:hidden flex items-center gap-2">
          {token && (
            <span className="text-[10px] uppercase font-bold text-[#00C2FF] border border-[#00C2FF] px-2 py-0.5">
              {role}
            </span>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white p-1 focus:outline-none flex items-center justify-center"
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <CloseIcon className="w-6 h-6" /> : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="square" strokeLinejoin="miter" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {menuOpen && (
        <div className="lg:hidden bg-black border-t-2 border-[#2563EB] p-4 flex flex-col gap-2 font-bold text-sm tracking-wide">
          <Link
            to="/feed"
            onClick={() => setMenuOpen(false)}
            className="py-2.5 px-4 bg-gray-900 text-[#00FF85] border border-gray-800 flex items-center gap-2"
          >
            <SearchIcon className="w-4 h-4" />
            <span>Public Feed (All Lost & Found)</span>
          </Link>

          {!token ? (
            <div className="flex gap-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="flex-1 text-center py-2 bg-gray-800 text-white border border-white text-xs uppercase"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="flex-1 text-center py-2 bg-[#2563EB] text-white border border-white text-xs uppercase"
              >
                Register
              </Link>
            </div>
          ) : (
            <>
              <Link
                to="/lost/new"
                onClick={() => setMenuOpen(false)}
                className="py-2.5 px-4 bg-gray-900 text-white border border-gray-800 flex items-center gap-2"
              >
                <AlertIcon className="w-4 h-4 text-red-500" />
                <span>Report Lost Item</span>
              </Link>
              <Link
                to="/found/new"
                onClick={() => setMenuOpen(false)}
                className="py-2.5 px-4 bg-gray-900 text-white border border-gray-800 flex items-center gap-2"
              >
                <CameraIcon className="w-4 h-4 text-[#00C2FF]" />
                <span>Report Found Item</span>
              </Link>
              <Link
                to="/matches"
                onClick={() => setMenuOpen(false)}
                className="py-2.5 px-4 bg-gray-900 text-[#FFD60A] border border-gray-800 flex items-center gap-2"
              >
                <LightningIcon className="w-4 h-4 text-[#FFD60A]" />
                <span>My AI Matches</span>
              </Link>
              <Link
                to="/claims"
                onClick={() => setMenuOpen(false)}
                className="py-2.5 px-4 bg-gray-900 text-[#FF9F1C] border border-gray-800 flex items-center gap-2"
              >
                {role === "security" ? (
                  <>
                    <ShieldIcon className="w-4 h-4 text-[#FF9F1C]" />
                    <span>Security Handover Desk</span>
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4 text-[#FF9F1C]" />
                    <span>Claims & Handover</span>
                  </>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="text-center py-2 mt-2 bg-red-600 text-white border border-white text-xs uppercase font-bold"
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

