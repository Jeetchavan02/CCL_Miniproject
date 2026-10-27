import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Spinner from "../components/Spinner";
import { BoxIcon, LocationIcon, CalendarIcon, CameraIcon } from "../components/Icons";

export default function FoundList() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const categories = ["All", "Electronics", "Bags", "Clothing", "Documents", "Other"];

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/items/found`);
      if (!res.ok) throw new Error("Failed to load found items feed.");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      categoryFilter === "All" ||
      item.category?.toLowerCase() === categoryFilter.toLowerCase();
    const matchesSearch =
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.location_found?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="border-b-4 border-black pb-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-black flex items-center gap-2">
            <BoxIcon className="w-7 h-7 text-emerald-600" />
            <span>Found Items Catalog</span>
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Browse items turned into Campus Security. Think something is yours? Click claim to verify ownership.
          </p>
        </div>
        <Link
          to="/found/new"
          className="bg-[#00FF85] text-black font-bold text-xs uppercase px-4 py-2.5 border-2 border-black neo-btn self-start md:self-auto"
        >
          + Report Found Item
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border-2 border-black neo-box p-4 mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, location (e.g. Canteen, Lab 4), or keyword..."
              className="w-full p-3 border-2 border-black rounded-none focus:outline-none focus:border-[#2563EB] bg-white font-medium text-sm"
            />
          </div>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="px-4 py-2 border-2 border-black neo-btn bg-gray-100 font-bold text-xs uppercase"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 py-1.5 mr-2">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 text-xs font-bold border-2 border-black uppercase neo-btn transition-colors ${
                categoryFilter === cat
                  ? "bg-[#2563EB] text-white"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && <Spinner />}

      {error && (
        <div className="border-2 border-red-600 bg-red-50 text-red-700 p-4 mb-6 text-sm neo-box font-medium">
          {error}
        </div>
      )}

      {/* Feed Grid */}
      {!loading && !error && filteredItems.length === 0 && (
        <div className="bg-white border-2 border-black neo-box p-12 text-center">
          <p className="text-lg font-bold text-black mb-2">No found items match your criteria.</p>
          <p className="text-sm text-gray-600">
            Try adjusting your search query or selecting a different category.
          </p>
        </div>
      )}

      {!loading && !error && filteredItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border-2 border-black neo-box flex flex-col justify-between overflow-hidden"
            >
              <div>
                {/* Image Thumbnail */}
                <div className="h-48 bg-gray-100 border-b-2 border-black relative flex items-center justify-center overflow-hidden">
                  {item.presigned_url ? (
                    <img
                      src={item.presigned_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 font-bold text-xs uppercase flex flex-col items-center gap-1">
                      <CameraIcon className="w-8 h-8 text-gray-400" />
                      <span>No Photo Attached</span>
                    </div>
                  )}

                  {/* Status Badge */}
                  <span
                    className={`absolute top-2 right-2 text-[10px] font-black uppercase px-2 py-0.5 border border-black ${
                      item.status === "claimed"
                        ? "bg-[#00FF85] text-black"
                        : "bg-yellow-300 text-black"
                    }`}
                  >
                    {item.status || "reported"}
                  </span>
                </div>

                {/* Details */}
                <div className="p-5">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-[#F0F4FF] border border-black px-2 py-0.5 text-[#2563EB]">
                    {item.category}
                  </span>

                  <h3 className="text-lg font-bold text-black mt-2 mb-1 truncate">
                    {item.title}
                  </h3>

                  <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                    <LocationIcon className="w-3.5 h-3.5 text-gray-500" />
                    <span>Found at: <span className="font-semibold text-black">{item.location_found}</span></span>
                  </p>

                  <p className="text-[11px] text-gray-500 mb-3 flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                    <span>{new Date(item.date_found).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}</span>
                  </p>

                  {item.description && (
                    <p className="text-xs text-gray-700 bg-gray-50 border border-black p-2 line-clamp-3">
                      "{item.description}"
                    </p>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="p-4 border-t-2 border-black bg-gray-50">
                <Link
                  to={`/claims?item_id=${item.id}`}
                  className="w-full block text-center bg-[#2563EB] text-white py-2 border-2 border-black neo-btn font-bold text-xs uppercase tracking-wide hover:bg-[#1d4ed8]"
                >
                  Claim This Item →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
