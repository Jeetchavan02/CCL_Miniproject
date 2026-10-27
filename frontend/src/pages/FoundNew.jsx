import React, { useState, useRef, useEffect } from "react";
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
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submittedItem, setSubmittedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentlyFound, setRecentlyFound] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  // Fetch all recent found items to display underneath the form
  const fetchRecentFound = async () => {
    try {
      setLoadingRecent(true);
      const res = await fetch(`${apiUrl}/items/found`);
      if (res.ok) {
        const data = await res.json();
        setRecentlyFound(data);
      }
    } catch (e) {
      console.log("Error loading recent found items", e);
    } finally {
      setLoadingRecent(false);
    }
  };

  useEffect(() => {
    fetchRecentFound();
  }, [apiUrl]);


  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Whenever isCameraActive changes to true and stream exists, attach it to video element
  useEffect(() => {
    if (isCameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((err) => console.log("Video play error:", err));
    }
  }, [isCameraActive]);

  const startCamera = async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      // Wait for next render cycle so ref is attached
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((e) => console.log("Play err", e));
        }
      }, 100);
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError(
        "Could not access camera. Please allow camera permissions in your browser or upload an image file instead."
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };


  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `camera_found_${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        setImage(file);
        setPreviewUrl(URL.createObjectURL(file));
        stopCamera();
      },
      "image/jpeg",
      0.9
    );
  };

  const handleFileSelect = (file) => {
    if (isCameraActive) stopCamera();
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removePhoto = () => {
    setImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };


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

      setSubmittedItem(data);
      setSuccess(true);
      // Reset form fields
      setTitle("");
      setDescription("");
      setLocationFound("");
      removePhoto();
      // Refresh the recent found list
      fetchRecentFound();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const [selectedItem, setSelectedItem] = useState(null);

  const getItemImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${apiUrl}${url}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* PHOTO & DETAILS MODAL */}
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

            {/* Photo Preview in Modal */}
            <div className="border-2 border-black bg-gray-100 h-64 mb-4 flex items-center justify-center overflow-hidden">
              {getItemImageUrl(selectedItem.presigned_url) ? (
                <img
                  src={getItemImageUrl(selectedItem.presigned_url)}
                  alt={selectedItem.title}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentElement.innerHTML =
                      '<div class="text-center text-gray-500 font-bold text-xs p-4"><span class="text-4xl block mb-2">📦</span>IMAGE STORED ON CLOUD / LOCAL PREVIEW UNAVAILABLE</div>';
                  }}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center text-gray-400 p-4 font-bold text-xs">
                  <span className="text-4xl block mb-2">📦</span>
                  NO PHOTO UPLOADED FOR THIS ITEM
                </div>
              )}
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="font-bold text-gray-600">Location Found:</span>
                <span className="font-semibold text-black">{selectedItem.location_found}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="font-bold text-gray-600">Date Logged:</span>
                <span className="font-semibold text-black">
                  {new Date(selectedItem.date_found).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="font-bold text-gray-600">Custody Status:</span>
                <span className="font-bold uppercase text-xs bg-yellow-300 border border-black px-2 py-0.5">
                  {selectedItem.status || "reported"}
                </span>
              </div>

              {selectedItem.description && (
                <div className="pt-2">
                  <span className="font-bold text-gray-600 block mb-1">Finder's Description:</span>
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

      {/* Main Container */}
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

            {cameraError && (
              <div className="border border-red-500 bg-red-50 text-red-600 text-xs p-2 mb-3">
                {cameraError}
              </div>
            )}

            {/* Camera / Upload Mode Buttons */}
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                type="button"
                onClick={isCameraActive ? stopCamera : startCamera}
                className={`px-3 py-2 border-2 border-black font-bold text-xs uppercase neo-btn flex items-center gap-1.5 ${
                  isCameraActive
                    ? "bg-red-500 text-white"
                    : "bg-[#00FF85] text-black"
                }`}
              >
                <span>📷</span> {isCameraActive ? "Close Camera" : "Open Camera"}
              </button>

              <label className="px-3 py-2 border-2 border-black font-bold text-xs uppercase neo-btn bg-white text-black cursor-pointer flex items-center gap-1.5">
                <span>📁</span> Upload File
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
              </label>

              {previewUrl && (
                <button
                  type="button"
                  onClick={removePhoto}
                  className="px-3 py-2 border-2 border-black font-bold text-xs uppercase neo-btn bg-gray-200 text-black ml-auto"
                >
                  ✕ Remove Photo
                </button>
              )}
            </div>

            {/* Live Camera Feed */}
            {isCameraActive && (
              <div className="border-2 border-black bg-black p-2 mb-4 neo-box">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  onLoadedMetadata={() => {
                    if (videoRef.current) {
                      videoRef.current.play().catch((e) => console.log(e));
                    }
                  }}
                  className="w-full max-h-72 object-cover bg-black border border-white"
                />
                <div className="mt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="bg-[#2563EB] text-white px-6 py-2 border-2 border-white neo-btn font-bold text-sm tracking-wide flex items-center gap-2"
                  >
                    <span>📸</span> Capture Snapshot
                  </button>
                </div>
              </div>
            )}

            {/* Captured or Uploaded Preview */}
            {previewUrl && !isCameraActive && (
              <div className="border-2 border-black p-3 bg-[#F0F4FF] mb-3 flex items-center gap-4">
                <img
                  src={previewUrl}
                  alt="Item preview"
                  className="w-20 h-20 object-cover border-2 border-black"
                />
                <div className="text-xs">
                  <p className="font-bold text-black uppercase">Photo Attached</p>
                  <p className="text-gray-600 truncate max-w-xs">{image?.name}</p>
                  <p className="text-green-700 font-semibold mt-1">✓ Ready for Rekognition analysis</p>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2563EB] text-white py-3 border-2 border-black neo-btn font-bold tracking-wide mt-4"
          >
            {loading ? "Analyzing Image & Submitting..." : "Submit Report"}
          </button>
        </form>

        {/* Immediate Submission Feedback Card */}
        {success && submittedItem && (
          <div className="mt-6 border-2 border-black bg-[#00FF85] p-5 neo-box">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs uppercase font-black bg-black text-white px-2 py-0.5">
                  ✓ Report Successfully Logged
                </span>
                <h3 className="text-xl font-bold text-black mt-2">
                  {submittedItem.title} (#{submittedItem.id})
                </h3>
                <p className="text-xs text-black mt-1 font-medium">
                  Location: <span className="font-bold">{submittedItem.location_found}</span> • Category: <span className="font-bold">{submittedItem.category}</span>
                </p>
                <p className="text-xs text-black mt-1">
                  🤖 Rekognition labels extracted & automated matching initiated.
                </p>
              </div>
              {submittedItem.presigned_url && (
                <img
                  src={submittedItem.presigned_url}
                  alt={submittedItem.title}
                  className="w-16 h-16 object-cover border-2 border-black"
                />
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-black">
              <button
                onClick={() => setSuccess(false)}
                className="bg-white text-black font-bold text-xs uppercase px-3 py-1.5 border-2 border-black neo-btn"
              >
                + Report Another Item
              </button>
              <button
                onClick={() => navigate("/matches")}
                className="bg-[#2563EB] text-white font-bold text-xs uppercase px-3 py-1.5 border-2 border-black neo-btn"
              >
                View Matches →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RECENTLY LOGGED FOUND ITEMS FEED */}
      <div className="mt-12">
        <div className="border-b-4 border-black pb-3 mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-black flex items-center gap-2">
              <span>📋</span> All Found Items in Custody
            </h2>
            <p className="text-gray-600 text-xs mt-0.5">
              Live inventory of items turned into Campus Security (Total: {recentlyFound.length})
            </p>
          </div>
          <button
            onClick={fetchRecentFound}
            className="text-xs font-bold bg-white text-black border-2 border-black px-3 py-1 neo-btn uppercase"
          >
            ↻ Refresh
          </button>
        </div>

        {loadingRecent ? (
          <p className="text-xs font-bold text-gray-500">Loading found items inventory...</p>
        ) : recentlyFound.length === 0 ? (
          <div className="bg-white border-2 border-black p-6 text-center neo-box">
            <p className="text-sm font-bold text-black">No items currently reported found. Log one above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentlyFound.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="bg-white border-2 border-black neo-box p-4 flex gap-4 items-start cursor-pointer hover:border-[#2563EB] transition-all group"
                title="Click to view details and full image"
              >
                {/* Photo Thumbnail */}
                <div className="w-24 h-24 bg-gray-100 border-2 border-black flex-shrink-0 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                  {getItemImageUrl(item.presigned_url) ? (
                    <img
                      src={getItemImageUrl(item.presigned_url)}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">📦</span>
                  )}
                </div>


                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-black uppercase bg-[#F0F4FF] border border-black px-1.5 py-0.5 text-[#2563EB]">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-black uppercase bg-yellow-300 border border-black px-1.5 py-0.5">
                      {item.status || "reported"}
                    </span>
                  </div>

                  <h3 className="font-bold text-black text-sm truncate">{item.title}</h3>
                  <p className="text-[11px] text-gray-600">
                    📍 {item.location_found}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    🗓 {new Date(item.date_found).toLocaleDateString()}
                  </p>

                  {item.description && (
                    <p className="text-xs text-gray-700 bg-gray-50 border border-gray-300 p-1.5 mt-2 line-clamp-2">
                      "{item.description}"
                    </p>
                  )}

                  {/* Expand Cue */}
                  <div className="mt-3 flex items-center justify-between text-[11px] font-black text-[#2563EB] group-hover:translate-x-1 transition-transform">
                    <span>Click to expand</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


