import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckIcon } from "../components/Icons";

export default function LostNew() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateLost, setDateLost] = useState(new Date().toISOString().slice(0, 16));
  const [locationLost, setLocationLost] = useState("");
  const [unsureLocation, setUnsureLocation] = useState(false);
  const [category, setCategory] = useState("Electronics");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formattedDate = new Date(dateLost).toISOString().slice(0, 19);
      const finalLocation = unsureLocation
        ? "Somewhere on Campus (Location Unknown / Not Sure)"
        : locationLost;

      const res = await fetch(`${apiUrl}/items/lost`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          date_lost: formattedDate,
          location_lost: finalLocation,
          category,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to submit lost item report.");
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/matches");
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white border-2 border-black neo-box p-8">
        <h1 className="text-3xl font-bold text-black mb-2">Report Lost Item</h1>
        <p className="text-gray-600 text-sm mb-6">
          Provide detailed information so our AI engine can find matching items.
        </p>

        {error && (
          <div className="border-2 border-red-600 bg-red-50 text-red-700 p-3 mb-6 text-sm neo-box font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="border-2 border-black bg-[#00FF85] text-black p-4 mb-6 text-sm neo-box font-bold flex items-center gap-2">
            <CheckIcon className="w-4 h-4 text-black" />
            <span>Report submitted! Checking potential matches...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block uppercase font-bold text-xs tracking-wider mb-2 text-black">
              ITEM TITLE
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border-2 border-black rounded-none focus:outline-none focus:border-[#2563EB] bg-white font-medium"
              placeholder="e.g. Blue Dell Inspiron Laptop"
            />
          </div>

          <div>
            <label className="block uppercase font-bold text-xs tracking-wider mb-2 text-black">
              CATEGORY
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border-2 border-black rounded-none focus:outline-none focus:border-[#2563EB] bg-white font-medium"
            >
              <option value="Electronics">Electronics</option>
              <option value="Bags">Bags</option>
              <option value="Clothing">Clothing</option>
              <option value="Documents">Documents</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block uppercase font-bold text-xs tracking-wider mb-2 text-black">
                APPROXIMATE DATE & TIME LOST
              </label>
              <input
                type="datetime-local"
                required
                value={dateLost}
                onChange={(e) => setDateLost(e.target.value)}
                className="w-full p-3 border-2 border-black rounded-none focus:outline-none focus:border-[#2563EB] bg-white font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block uppercase font-bold text-xs tracking-wider text-black">
                  LAST SEEN LOCATION
                </label>
              </div>
              <input
                type="text"
                required={!unsureLocation}
                disabled={unsureLocation}
                value={unsureLocation ? "Somewhere on Campus (Location Unknown / Not Sure)" : locationLost}
                onChange={(e) => setLocationLost(e.target.value)}
                className={`w-full p-3 border-2 border-black rounded-none focus:outline-none focus:border-[#2563EB] font-medium ${
                  unsureLocation ? "bg-gray-100 text-gray-500 italic cursor-not-allowed" : "bg-white text-black"
                }`}
                placeholder="e.g. Library 3rd Floor"
              />
              <label className="mt-2 flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-gray-700">
                <input
                  type="checkbox"
                  checked={unsureLocation}
                  onChange={(e) => {
                    setUnsureLocation(e.target.checked);
                    if (e.target.checked) setLocationLost("");
                  }}
                  className="w-4 h-4 border-2 border-black accent-[#2563EB] rounded-none cursor-pointer"
                />
                <span>I am not sure of the exact location / Misplaced somewhere on campus</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block uppercase font-bold text-xs tracking-wider mb-2 text-black">
              DETAILED DESCRIPTION
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border-2 border-black rounded-none focus:outline-none focus:border-[#2563EB] bg-white font-medium"
              placeholder="Mention identifying stickers, scratches, colors, case brand, or accessories..."
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-[#2563EB] text-white py-3 border-2 border-black neo-btn font-bold tracking-wide mt-4"
          >
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>
    </div>
  );
}
