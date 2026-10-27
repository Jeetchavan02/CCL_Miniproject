import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FoundNew() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateFound, setDateFound] = useState(new Date().toISOString().slice(0, 16));
  const [locationFound, setLocationFound] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formattedDate = new Date(dateFound).toISOString().slice(0, 19);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("category", category);
      formData.append("date_found", formattedDate);
      formData.append("location_found", locationFound);
      if (description) formData.append("description", description);
      if (image) formData.append("image", image);

      const res = await fetch(`${apiUrl}/items/found`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to submit found item report.");
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
    <div className="max-w-2xl mx-auto p-4 py-8">
      <div className="bg-white border-2 border-black neo-box p-8">
        <h1 className="text-3xl font-bold text-black mb-2">Report Found Item</h1>
        <p className="text-gray-600 text-sm mb-6">
          Log a recovered item. Uploading an image enables automatic AI label & feature detection.
        </p>

        {error && (
          <div className="border-2 border-red-600 bg-red-50 text-red-700 p-3 mb-6 text-sm neo-box font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="border-2 border-black bg-[#00FF85] text-black p-4 mb-6 text-sm neo-box font-bold flex items-center gap-2">
            <span>✓</span> Found item logged & Rekognition pipeline triggered!
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
              placeholder="e.g. Black HP Laptop Bag"
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
                DATE & TIME FOUND
              </label>
              <input
                type="datetime-local"
                required
                value={dateFound}
                onChange={(e) => setDateFound(e.target.value)}
                className="w-full p-3 border-2 border-black rounded-none focus:outline-none focus:border-[#2563EB] bg-white font-medium"
              />
            </div>

            <div>
              <label className="block uppercase font-bold text-xs tracking-wider mb-2 text-black">
                LOCATION FOUND
              </label>
              <input
                type="text"
                required
                value={locationFound}
                onChange={(e) => setLocationFound(e.target.value)}
                className="w-full p-3 border-2 border-black rounded-none focus:outline-none focus:border-[#2563EB] bg-white font-medium"
                placeholder="e.g. Canteen Table #4"
              />
            </div>
          </div>

          <div>
            <label className="block uppercase font-bold text-xs tracking-wider mb-2 text-black">
              DETAILED DESCRIPTION
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border-2 border-black rounded-none focus:outline-none focus:border-[#2563EB] bg-white font-medium"
              placeholder="Physical condition, unique marks, color..."
            />
          </div>

          <div>
            <label className="block uppercase font-bold text-xs tracking-wider mb-2 text-black">
              ITEM PHOTO (OPTIONAL — USED FOR AI MATCHING)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="w-full p-2.5 border-2 border-black rounded-none bg-white font-medium file:mr-4 file:py-2 file:px-4 file:border-2 file:border-black file:bg-[#F0F4FF] file:font-bold file:text-xs file:uppercase file:cursor-pointer hover:file:bg-[#2563EB] hover:file:text-white"
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
