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
  const [loading, setLoading] = useState(false);

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

