import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";

export default function Claims() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (role !== "security") {
      navigate("/matches");
      return;
    }

    const fetchFoundItems = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${apiUrl}/items/found`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to load found items for claims inspection.");
        const data = await res.json();
        setFoundItems(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFoundItems();
  }, [apiUrl, navigate, role, token]);

  if (loading) return <Spinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="border-b-4 border-black pb-4 mb-6">
        <h1 className="text-3xl font-bold text-black">Found Items — Claims</h1>
        <p className="text-gray-600 text-sm mt-1">
          Security Officer Desk: Review custody of turned-in property and student ownership claims.
        </p>
      </div>

      {error && (
        <div className="border-2 border-red-600 bg-red-50 text-red-700 p-4 mb-6 text-sm neo-box font-medium">
          {error}
        </div>
      )}

      {foundItems.length === 0 ? (
        <div className="bg-white border-2 border-black neo-box p-12 text-center">
          <p className="text-lg font-bold text-black">No found items currently logged in custody.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {foundItems.map((item) => (
            <div key={item.id} className="bg-white border-2 border-black neo-box p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs uppercase tracking-widest font-bold bg-[#F0F4FF] border border-black px-2 py-0.5 text-[#2563EB]">
                    {item.category}
                  </span>
                  <span className="text-xs font-bold uppercase px-2 py-0.5 border border-black bg-gray-100">
                    {item.status}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-black mb-1">{item.title}</h3>
                <p className="text-xs text-gray-600 mb-2">
                  Found at: <span className="font-semibold text-black">{item.location_found}</span> • {new Date(item.date_found).toLocaleDateString()}
                </p>

                {item.description && (
                  <p className="text-sm text-gray-700 mb-4 bg-gray-50 border border-black p-2.5">
                    "{item.description}"
                  </p>
                )}
              </div>

              <div className="pt-4 border-t-2 border-black flex items-center justify-between gap-3">
                {item.presigned_url ? (
                  <a
                    href={item.presigned_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-[#2563EB] underline hover:text-black"
                  >
                    View Photo
                  </a>
                ) : (
                  <span className="text-xs text-gray-400">No photo</span>
                )}

                <button
                  disabled
                  className="bg-gray-300 text-gray-600 px-4 py-2 border-2 border-black neo-btn text-xs font-bold"
                >
                  Resolve (Coming in P7)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
