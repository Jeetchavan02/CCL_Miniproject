import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LostNew from "./pages/LostNew";
import FoundNew from "./pages/FoundNew";
import Matches from "./pages/Matches";
import Claims from "./pages/Claims";

import Dashboard from "./pages/Dashboard";

// Route guard requiring authenticated user
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F0F4FF] flex flex-col font-sans">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={token ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/feed" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/lost/new"
              element={
                <ProtectedRoute>
                  <LostNew />
                </ProtectedRoute>
              }
            />
            <Route
              path="/found/new"
              element={
                <ProtectedRoute>
                  <FoundNew />
                </ProtectedRoute>
              }
            />
            <Route
              path="/matches"
              element={
                <ProtectedRoute>
                  <Matches />
                </ProtectedRoute>
              }
            />
            <Route
              path="/claims"
              element={
                <ProtectedRoute>
                  <Claims />
                </ProtectedRoute>
              }
            />

            {/* Default Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

