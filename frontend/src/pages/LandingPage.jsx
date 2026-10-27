import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SearchIcon } from "../components/Icons";

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already authenticated, take them directly to their matches
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/matches", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="bg-[#F0F4FF] py-20 px-6 border-b-4 border-black">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-[#00FF85] text-black border-2 border-black font-bold text-xs uppercase px-3 py-1 mb-6 neo-box">
            Smart Campus Recovery Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold text-black tracking-tight mb-6">
            Lost Something on Campus?
          </h1>

          <p className="text-base sm:text-xl text-gray-700 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            LostFound uses AI-powered vision and semantic matching to reunite students
            with their misplaced belongings. Report lost valuables, upload photos of found items,
            and receive automated match alerts the moment a match is identified.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link
              to="/lost/new"
              className="w-full sm:w-auto bg-[#2563EB] text-white px-8 py-4 border-2 border-black neo-btn font-bold text-lg text-center"
            >
              Report Lost Item
            </Link>

            <Link
              to="/found/new"
              className="w-full sm:w-auto bg-white text-black px-8 py-4 border-2 border-black neo-btn font-bold text-lg text-center"
            >
              I Found Something
            </Link>
          </div>

          <p className="text-sm font-medium text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="font-bold underline text-black hover:text-[#2563EB]">
              Login
            </Link>
          </p>
        </div>
      </section>

      {/* 2. HOW IT WORKS SECTION */}
      <section className="bg-white py-20 px-6 border-b-4 border-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-3">How It Works</h2>
            <p className="text-gray-600 font-medium max-w-lg mx-auto text-sm sm:text-base">
              Automated end-to-end recovery pipeline designed for speed and reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="border-2 border-black neo-box bg-[#F0F4FF] p-8 flex flex-col justify-between">
              <div>
                <span className="text-5xl font-bold text-[#2563EB] block mb-4">01</span>
                <h3 className="text-2xl font-bold text-black mb-2">Report Item</h3>
                <p className="text-gray-700 font-medium text-sm leading-relaxed">
                  Submit details about your lost item or upload photos of found property with location and timestamp.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t-2 border-black text-xs font-bold uppercase tracking-wider text-gray-500">
                Step 1: Intake
              </div>
            </div>

            {/* Card 2 */}
            <div className="border-2 border-black neo-box bg-[#F0F4FF] p-8 flex flex-col justify-between">
              <div>
                <span className="text-5xl font-bold text-[#2563EB] block mb-4">02</span>
                <h3 className="text-2xl font-bold text-black mb-2">AI Matching</h3>
                <p className="text-gray-700 font-medium text-sm leading-relaxed">
                  Our computer vision pipeline extracts visual labels, colors, and attributes from photos to score similarity against reports.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t-2 border-black text-xs font-bold uppercase tracking-wider text-gray-500">
                Step 2: Analysis
              </div>
            </div>

            {/* Card 3 */}
            <div className="border-2 border-black neo-box bg-[#F0F4FF] p-8 flex flex-col justify-between">
              <div>
                <span className="text-5xl font-bold text-[#2563EB] block mb-4">03</span>
                <h3 className="text-2xl font-bold text-black mb-2">Get Notified</h3>
                <p className="text-gray-700 font-medium text-sm leading-relaxed">
                  Receive real-time automated alerts the instant confidence thresholds are reached to claim your belongings promptly.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t-2 border-black text-xs font-bold uppercase tracking-wider text-gray-500">
                Step 3: Recovery
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. KEY CAPABILITIES / METRICS SECTION */}
      <section className="bg-[#2563EB] text-white py-14 px-6 border-b-4 border-black">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="md:border-r-2 md:border-white md:pr-8 flex flex-col justify-center">
            <h4 className="text-3xl font-bold tracking-tight mb-2">Automated Tagging</h4>
            <p className="text-blue-100 text-sm font-medium">
              Instant object recognition & visual attribute extraction
            </p>
          </div>

          <div className="md:border-r-2 md:border-white md:px-8 flex flex-col justify-center">
            <h4 className="text-3xl font-bold tracking-tight mb-2">Smart Scoring</h4>
            <p className="text-blue-100 text-sm font-medium">
              Weighted categorization & semantic keyword analysis
            </p>
          </div>

          <div className="md:pl-8 flex flex-col justify-center">
            <h4 className="text-3xl font-bold tracking-tight mb-2">Instant Alerts</h4>
            <p className="text-blue-100 text-sm font-medium">
              Real-time match dispatch to claimant inboxes
            </p>
          </div>
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="bg-black text-white py-8 px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm font-bold">
          <div className="text-[#00C2FF] flex items-center gap-2">
            <SearchIcon className="w-5 h-5 text-[#00C2FF]" />
            <span>LostFound</span>
          </div>
          <div className="text-gray-400 font-medium">
            Automated Campus Item Recovery System
          </div>
          <div className="text-gray-400">
            Intelligent Vision & Match Engine
          </div>
        </div>
      </footer>
    </div>
  );
}
