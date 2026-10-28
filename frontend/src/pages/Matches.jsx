import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import MatchCard from "../components/MatchCard";

export default function Matches() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  const [lostItems, setLostItems] = useState([]);
  const [matchesMap, setMatchesMap] = useState({});
  const [foundItemsMap, setFoundItemsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchMatchesData = async () => {
      setLoading(true);
      setError("");

      try {
        // 1. Fetch lost items (both open and resolved)
        const lostRes = await fetch(`${apiUrl}/items/lost`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!lostRes.ok) throw new Error("Could not fetch lost items.");
        const allLost = await lostRes.json();
        setLostItems(allLost);

        // 2. Fetch matches for each lost item
        const matchesByLost = {};
        const foundIdsToFetch = new Set();

        await Promise.all(
          allLost.map(async (lost) => {
            try {
              const matchRes = await fetch(`${apiUrl}/matches/lost/${lost.id}`);
              if (matchRes.ok) {
                const matches = await matchRes.json();
                matchesByLost[lost.id] = matches;
                matches.forEach((m) => foundIdsToFetch.add(m.found_item_id));
              }
            } catch (err) {
              console.error(`Error fetching matches for lost item ${lost.id}:`, err);
            }
          })
        );
        setMatchesMap(matchesByLost);

        // 3. Fetch found item details for all matches
        const foundMap = {};
        await Promise.all(
          Array.from(foundIdsToFetch).map(async (foundId) => {
            try {
              const foundRes = await fetch(`${apiUrl}/items/found/${foundId}`);
              if (foundRes.ok) {
                const foundData = await foundRes.json();
                foundMap[foundId] = foundData;
              }
            } catch (err) {
              console.error(`Error fetching found item ${foundId}:`, err);
            }
          })
        );
        setFoundItemsMap(foundMap);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatchesData();
  }, [apiUrl, navigate, token]);

  if (loading) return <Spinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black">My Matches</h1>
          <p className="text-gray-600 text-sm mt-1">
            Real-time AI matching based on categories and descriptions
          </p>
        </div>

        <Link
          to="/lost/new"
          className="bg-[#2563EB] text-white px-5 py-2.5 border-2 border-black neo-btn font-bold tracking-wide"
        >
          + Report Lost Item
        </Link>
      </div>

      {error && (
        <div className="border-2 border-red-600 bg-red-50 text-red-700 p-4 mb-6 text-sm neo-box font-medium">
          {error}
        </div>
      )}

      {lostItems.length === 0 ? (
        <div className="bg-white border-2 border-black neo-box p-12 text-center">
          <p className="text-xl font-bold text-black mb-2">No lost items reported yet</p>
          <p className="text-gray-600 text-sm mb-6 max-w-md mx-auto">
            Once you report a lost item, our automated pipeline will cross-reference newly turned-in belongings and alert you.
          </p>
          <Link
            to="/lost/new"
            className="inline-block bg-[#2563EB] text-white px-6 py-3 border-2 border-black neo-btn font-bold"
          >
            Report Your First Lost Item
          </Link>
        </div>
      ) : (
        lostItems.map((lost) => (
          <MatchCard
            key={lost.id}
            lostItem={lost}
            matches={matchesMap[lost.id] || []}
            foundItems={foundItemsMap}
          />
        ))
      )}
    </div>
  );
}
