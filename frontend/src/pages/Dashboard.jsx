import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";

export default function Dashboard() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role") || "student";
  const userEmail = localStorage.getItem("email") || "Student";

  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'found' | 'lost' | 'matches'
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);

  const categories = ["All", "Electronics", "Bags", "Clothing", "Documents", "Other"];

  useEffect(() => {
    fetchDashboardData();
  }, [apiUrl, token]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Fetch Found Items
      const foundRes = await fetch(`${apiUrl}/items/found`);
      const foundData = foundRes.ok ? await foundRes.json() : [];
      setFoundItems(foundData);

      // 2. Fetch Lost Items
      const lostRes = await fetch(`${apiUrl}/items/lost`);
      const lostData = lostRes.ok ? await lostRes.json() : [];
      setLostItems(lostData);

      // 3. Fetch Matches (if authenticated)
      if (token && lostData.length > 0) {
        let allMatches = [];
        for (const item of lostData) {
          try {
            const matchRes = await fetch(`${apiUrl}/matches/lost/${item.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (matchRes.ok) {
              const mData = await matchRes.json();
              if (Array.isArray(mData)) {
                mData.forEach((m) => allMatches.push({ ...m, lostItem: item }));
              }
            }
          } catch (e) {
            // ignore single item match errors
          }
        }
        setMatches(allMatches);
      }
    } catch (err) {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const getItemImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${apiUrl}${url}`;
  };

  // Filter items
  const filteredFound = foundItems.filter((item) => {
    const matchesCat =
      selectedCategory === "All" ||
      item.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesQuery =
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.location_found?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const filteredLost = lostItems.filter((item) => {
    const matchesCat =
      selectedCategory === "All" ||
      item.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesQuery =
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.location_lost?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Detail Modal */}
      {selectedItem && (
        <div
          onClick={() => setSelectedItem(null)}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border-4 border-black neo-box max-w-lg w-full max-h-[90vh] overflow-y-auto p-6"
          >
            <div className="flex justify-between items-start mb-4 border-b-2 border-black pb-3">
              <div>
                <span className="text-[10px] font-black uppercase bg-[#F0F4FF] border border-black px-2 py-0.5 text-[#2563EB]">
                  {selectedItem.category}
                </span>
                <h2 className="text-2xl font-bold text-black mt-1">
                  {selectedItem.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-black font-black text-lg border-2 border-black px-2 py-0.5 hover:bg-red-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            {selectedItem.presigned_url && (
              <div className="border-2 border-black bg-gray-100 h-64 mb-4 flex items-center justify-center overflow-hidden">
                <img
                  src={getItemImageUrl(selectedItem.presigned_url)}
                  alt={selectedItem.title}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentElement.innerHTML =
                      '<div class="text-center text-gray-500 font-bold text-xs p-4"><span class="text-4xl block mb-2">📦</span>IMAGE STORED ON AWS CLOUD</div>';
                  }}
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="font-bold text-gray-600">Location:</span>
                <span className="font-semibold text-black">
                  {selectedItem.location_found || selectedItem.location_lost}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="font-bold text-gray-600">Status:</span>
                <span className="font-bold uppercase text-xs bg-yellow-300 border border-black px-2 py-0.5">
                  {selectedItem.status}
                </span>
              </div>
              {selectedItem.description && (
                <div className="pt-2">
                  <span className="font-bold text-gray-600 block mb-1">Description:</span>
                  <p className="bg-gray-50 border border-black p-3 text-xs text-gray-800 font-mono">
                    "{selectedItem.description}"
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedItem(null)}
              className="mt-6 w-full bg-black text-white font-bold py-2.5 border-2 border-black neo-btn uppercase text-xs tracking-wider"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* DASHBOARD TOP HERO */}
      <div className="border-b-4 border-black pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#2563EB] text-white text-[10px] uppercase font-black px-2 py-0.5 border border-black">
              CAMPUS RECOVERY COMMAND CENTER
            </span>
            <span className="text-xs font-bold text-gray-600">
              Welcome, <span className="text-black font-black">{userEmail.split("@")[0]}</span> ({role})
            </span>
          </div>
          <h1 className="text-4xl font-black text-black tracking-tight">
            Campus Lost & Found Dashboard
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Real-time feed, AI vision match statistics, and item custody monitoring.
          </p>
        </div>

        {/* Quick Report Actions */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <Link
            to="/lost/new"
            className="bg-[#FF5555] text-white font-black text-xs uppercase px-4 py-2.5 border-2 border-black neo-btn"
          >
            + Report Lost
          </Link>
          <Link
            to="/found/new"
            className="bg-[#00FF85] text-black font-black text-xs uppercase px-4 py-2.5 border-2 border-black neo-btn"
          >
            + Report Found
          </Link>
        </div>
      </div>

      {/* 4 STATS TILES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border-2 border-black p-5 neo-box flex flex-col justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-gray-500">
            📦 Found in Custody
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-black text-black">{foundItems.length}</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-400">
              Logged
            </span>
          </div>
        </div>

        <div className="bg-white border-2 border-black p-5 neo-box flex flex-col justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-gray-500">
            🚨 Lost Reported
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-black text-black">{lostItems.length}</span>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 border border-red-400">
              Active
            </span>
          </div>
        </div>

        <div className="bg-white border-2 border-black p-5 neo-box flex flex-col justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-gray-500">
            ⚡ AI Matches Detected
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-black text-black">{matches.length}</span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 border border-amber-400">
              Rekognition
            </span>
          </div>
        </div>

        <div className="bg-white border-2 border-black p-5 neo-box flex flex-col justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-gray-500">
            🛡️ Recovery Status
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-black text-black">
              {foundItems.filter((i) => i.status === "claimed").length}
            </span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 border border-blue-400">
              Resolved
            </span>
          </div>
        </div>
      </div>

      {/* CHARTS & RECOVERY LIFECYCLE SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* CHART 1: Category Distribution Bar Chart */}
        <div className="bg-white border-2 border-black neo-box p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-2">
            <div>
              <h2 className="text-lg font-bold text-black flex items-center gap-2">
                <span>📊</span> Category Breakdown (Lost vs. Found)
              </h2>
              <p className="text-xs text-gray-500">
                Visualizing distribution of valuables across campus categories
              </p>
            </div>
            <span className="text-[10px] font-black uppercase bg-[#F0F4FF] border border-black px-2 py-0.5 text-[#2563EB]">
              LIVE STATS
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {["Electronics", "Bags", "Documents", "Clothing", "Other"].map((cat) => {
              const foundCount = foundItems.filter((i) => i.category === cat).length;
              const lostCount = lostItems.filter((i) => i.category === cat).length;
              const totalCat = foundCount + lostCount;
              const maxCat = Math.max(
                ...["Electronics", "Bags", "Documents", "Clothing", "Other"].map(
                  (c) =>
                    foundItems.filter((i) => i.category === c).length +
                    lostItems.filter((i) => i.category === c).length
                ),
                1
              );
              const pct = Math.round((totalCat / maxCat) * 100);

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-black">
                    <span className="uppercase">{cat}</span>
                    <span className="text-gray-600">
                      <span className="text-emerald-600">{foundCount} Found</span> •{" "}
                      <span className="text-red-600">{lostCount} Lost</span> (Total: {totalCat})
                    </span>
                  </div>

                  {/* Dual Bar Graphic */}
                  <div className="w-full bg-gray-100 border border-black h-5 flex overflow-hidden">
                    <div
                      style={{
                        width: `${totalCat > 0 ? (foundCount / totalCat) * pct : 0}%`,
                      }}
                      className="bg-[#00FF85] border-r border-black h-full flex items-center justify-center text-[10px] font-black text-black transition-all"
                      title={`${foundCount} Found`}
                    >
                      {foundCount > 0 ? foundCount : ""}
                    </div>
                    <div
                      style={{
                        width: `${totalCat > 0 ? (lostCount / totalCat) * pct : 0}%`,
                      }}
                      className="bg-[#FF5555] h-full flex items-center justify-center text-[10px] font-black text-white transition-all"
                      title={`${lostCount} Lost`}
                    >
                      {lostCount > 0 ? lostCount : ""}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-6 mt-5 pt-3 border-t border-gray-200 text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#00FF85] border border-black inline-block" />
              <span>Found in Custody</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#FF5555] border border-black inline-block" />
              <span>Reported Lost</span>
            </div>
          </div>
        </div>

        {/* CHART 2: Recovery Pipeline Funnel / Process Flow */}
        <div className="bg-white border-2 border-black neo-box p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-2">
              <h2 className="text-lg font-bold text-black flex items-center gap-2">
                <span>🔄</span> Recovery Lifecycle
              </h2>
              <span className="text-[10px] font-black uppercase bg-[#00FF85] text-black px-2 py-0.5 border border-black">
                PIPELINE
              </span>
            </div>

            <p className="text-xs text-gray-600 mb-4">
              Real-time pipeline tracking items from report to custody resolution.
            </p>

            <div className="space-y-3">
              {/* Step 1 */}
              <div className="p-2.5 border-2 border-black bg-[#F0F4FF] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-blue-700 block">
                    STAGE 1: REPORTED
                  </span>
                  <span className="font-bold text-sm text-black">Initial Custody Log</span>
                </div>
                <span className="text-base font-black bg-white border border-black px-2.5 py-0.5">
                  {foundItems.length + lostItems.length}
                </span>
              </div>

              {/* Step 2 */}
              <div className="p-2.5 border-2 border-black bg-yellow-50 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-700 block">
                    STAGE 2: AI MATCHED
                  </span>
                  <span className="font-bold text-sm text-black">Rekognition Verified</span>
                </div>
                <span className="text-base font-black bg-white border border-black px-2.5 py-0.5">
                  {matches.length}
                </span>
              </div>

              {/* Step 3 */}
              <div className="p-2.5 border-2 border-black bg-emerald-50 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-700 block">
                    STAGE 3: RESOLVED
                  </span>
                  <span className="font-bold text-sm text-black">Claim Handover Complete</span>
                </div>
                <span className="text-base font-black bg-white border border-black px-2.5 py-0.5">
                  {foundItems.filter((i) => i.status === "claimed").length}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-black text-[11px] text-gray-600">
            <span className="font-bold text-black">Automated Matching:</span> AWS Rekognition vision scoring + SNS broadcast enabled.
          </div>
        </div>
      </div>


      {/* FILTER & SEARCH BAR */}
      <div className="bg-white border-2 border-black neo-box p-4 mb-6 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items by name, campus location (e.g. Canteen, Lab 4, 707), or keyword..."
            className="flex-1 p-3 border-2 border-black rounded-none focus:outline-none focus:border-[#2563EB] bg-white font-medium text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="px-4 py-2 border-2 border-black neo-btn bg-gray-100 font-bold text-xs uppercase"
            >
              Clear
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 mr-1">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-bold border-2 border-black uppercase neo-btn transition-colors ${
                selectedCategory === cat
                  ? "bg-[#2563EB] text-white"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b-4 border-black mb-6">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-5 py-3 font-black text-xs uppercase tracking-wider border-t-2 border-l-2 border-r-2 border-black transition-all ${
            activeTab === "all"
              ? "bg-black text-white"
              : "bg-white text-black hover:bg-gray-100"
          }`}
        >
          🔍 All Live Activity ({filteredFound.length + filteredLost.length})
        </button>

        <button
          onClick={() => setActiveTab("found")}
          className={`px-5 py-3 font-black text-xs uppercase tracking-wider border-t-2 border-r-2 border-black transition-all ${
            activeTab === "found"
              ? "bg-[#00FF85] text-black"
              : "bg-white text-black hover:bg-gray-100"
          }`}
        >
          📦 Found Items ({filteredFound.length})
        </button>

        <button
          onClick={() => setActiveTab("lost")}
          className={`px-5 py-3 font-black text-xs uppercase tracking-wider border-t-2 border-r-2 border-black transition-all ${
            activeTab === "lost"
              ? "bg-[#FF5555] text-white"
              : "bg-white text-black hover:bg-gray-100"
          }`}
        >
          🚨 Lost Items ({filteredLost.length})
        </button>

        <button
          onClick={() => setActiveTab("matches")}
          className={`px-5 py-3 font-black text-xs uppercase tracking-wider border-t-2 border-r-2 border-black transition-all ${
            activeTab === "matches"
              ? "bg-[#FFD60A] text-black"
              : "bg-white text-black hover:bg-gray-100"
          }`}
        >
          ⚡ AI Matches ({matches.length})
        </button>
      </div>

      {/* FEED CONTENT */}
      {loading ? (
        <Spinner />
      ) : error ? (
        <div className="border-2 border-red-600 bg-red-50 text-red-700 p-4 neo-box font-medium text-sm">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* TAB: FOUND ITEMS OR ALL */}
          {(activeTab === "all" || activeTab === "found") &&
            filteredFound.map((item) => (
              <div
                key={`found-${item.id}`}
                onClick={() => setSelectedItem(item)}
                className="bg-white border-2 border-black neo-box flex flex-col justify-between cursor-pointer hover:border-[#2563EB] transition-all group overflow-hidden"
              >
                <div>
                  {/* Photo area */}
                  <div className="h-44 bg-gray-100 border-b-2 border-black flex items-center justify-center relative overflow-hidden">
                    {item.presigned_url ? (
                      <img
                        src={getItemImageUrl(item.presigned_url)}
                        alt={item.title}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.innerHTML =
                            '<div class="text-gray-400 font-bold text-xs uppercase flex flex-col items-center"><span class="text-3xl mb-1">📦</span><span>Photo in Cloud</span></div>';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="text-gray-400 font-bold text-xs uppercase flex flex-col items-center">
                        <span className="text-3xl mb-1">📦</span>
                        <span>No Photo</span>
                      </div>
                    )}
                    <span className="absolute top-2 left-2 text-[10px] font-black uppercase px-2 py-0.5 bg-[#00FF85] text-black border border-black">
                      FOUND
                    </span>
                    <span className="absolute top-2 right-2 text-[10px] font-black uppercase px-2 py-0.5 bg-yellow-300 text-black border border-black">
                      {item.status || "reported"}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-4">
                    <span className="text-[10px] font-black uppercase bg-[#F0F4FF] border border-black px-1.5 py-0.5 text-[#2563EB]">
                      {item.category}
                    </span>
                    <h3 className="font-bold text-black text-base mt-2 truncate">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      📍 Found at: <span className="font-bold text-black">{item.location_found}</span>
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      🗓 {new Date(item.date_found).toLocaleDateString()}
                    </p>
                    {item.description && (
                      <p className="text-xs text-gray-700 bg-gray-50 border border-gray-300 p-2 mt-2 line-clamp-2">
                        "{item.description}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-3 border-t-2 border-black bg-gray-50 flex items-center justify-between text-xs font-black">
                  <span className="text-[#2563EB]">Click to view details</span>
                  <span>→</span>
                </div>
              </div>
            ))}

          {/* TAB: LOST ITEMS OR ALL */}
          {(activeTab === "all" || activeTab === "lost") &&
            filteredLost.map((item) => (
              <div
                key={`lost-${item.id}`}
                onClick={() => setSelectedItem(item)}
                className="bg-white border-2 border-black neo-box flex flex-col justify-between cursor-pointer hover:border-red-600 transition-all group overflow-hidden"
              >
                <div>
                  <div className="h-44 bg-red-50 border-b-2 border-black flex flex-col items-center justify-center relative p-4">
                    <span className="text-4xl mb-2">🚨</span>
                    <span className="text-xs font-black text-red-600 uppercase tracking-widest">
                      LOST VALUABLE
                    </span>
                    <span className="absolute top-2 left-2 text-[10px] font-black uppercase px-2 py-0.5 bg-[#FF5555] text-white border border-black">
                      LOST
                    </span>
                    <span className="absolute top-2 right-2 text-[10px] font-black uppercase px-2 py-0.5 bg-white text-black border border-black">
                      {item.status || "open"}
                    </span>
                  </div>

                  <div className="p-4">
                    <span className="text-[10px] font-black uppercase bg-[#F0F4FF] border border-black px-1.5 py-0.5 text-[#2563EB]">
                      {item.category}
                    </span>
                    <h3 className="font-bold text-black text-base mt-2 truncate">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      📍 Misplaced near: <span className="font-bold text-black">{item.location_lost}</span>
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      🗓 {new Date(item.date_lost).toLocaleDateString()}
                    </p>
                    {item.description && (
                      <p className="text-xs text-gray-700 bg-gray-50 border border-gray-300 p-2 mt-2 line-clamp-2">
                        "{item.description}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-3 border-t-2 border-black bg-gray-50 flex items-center justify-between text-xs font-black">
                  <span className="text-red-600">Click to view details</span>
                  <span>→</span>
                </div>
              </div>
            ))}

          {/* TAB: MATCHES */}
          {activeTab === "matches" && (
            <div className="col-span-full">
              {matches.length === 0 ? (
                <div className="bg-white border-2 border-black p-12 text-center neo-box">
                  <span className="text-4xl block mb-2">⚡</span>
                  <p className="font-bold text-lg text-black">No matches computed yet.</p>
                  <p className="text-xs text-gray-600 mt-1">
                    When you report a lost item and someone turns in a matching found item, Rekognition analyzes features and creates automated alerts here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matches.map((m) => (
                    <div
                      key={m.id}
                      className="bg-white border-2 border-black neo-box p-5 flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="bg-[#FFD60A] text-black font-black text-xs uppercase px-2 py-0.5 border border-black">
                          ⚡ AI Match #{m.id}
                        </span>
                        <span className="text-lg font-black text-[#2563EB]">
                          {(m.confidence_score * 100).toFixed(0)}% Score
                        </span>
                      </div>

                      <div className="bg-[#F0F4FF] border border-black p-3 mb-3 text-xs">
                        <p className="font-bold text-black">
                          Lost Item: {m.lostItem?.title || `#${m.lost_item_id}`}
                        </p>
                        <p className="text-gray-600">
                          Matched with Found Item #{m.found_item_id}
                        </p>
                      </div>

                      <Link
                        to="/matches"
                        className="text-center bg-[#2563EB] text-white py-2 border-2 border-black neo-btn font-bold text-xs uppercase tracking-wide"
                      >
                        Review Match & Verify →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
