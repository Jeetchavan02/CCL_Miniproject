import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Spinner from "../components/Spinner";

export default function Claims() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialItemId = searchParams.get("item_id");

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role") || "student";

  const [claims, setClaims] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Student Claim Form State
  const [selectedItemId, setSelectedItemId] = useState(initialItemId || "");
  const [proofText, setProofText] = useState("");
  const [submittingClaim, setSubmittingClaim] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [apiUrl, navigate, token]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Fetch claims
      const claimsRes = await fetch(`${apiUrl}/items/claims`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (claimsRes.ok) {
        const cData = await claimsRes.json();
        setClaims(cData);
      }

      // 2. Fetch found items
      const foundRes = await fetch(`${apiUrl}/items/found`);
      if (foundRes.ok) {
        const fData = await foundRes.json();
        setFoundItems(fData);
      }
    } catch (err) {
      setError("Failed to load claims desk data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    if (!selectedItemId || !proofText) return;

    setSubmittingClaim(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch(`${apiUrl}/items/claims`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          found_item_id: parseInt(selectedItemId),
          proof_description: proofText,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to submit claim.");

      setSuccessMsg("Claim submitted successfully! Security will review your proof.");
      setProofText("");
      setSelectedItemId("");
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingClaim(false);
    }
  };

  const handleResolve = async (claimId, action) => {
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch(
        `${apiUrl}/items/claims/${claimId}/resolve?action=${action}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || `Failed to ${action} claim.`);

      setSuccessMsg(
        action === "approve"
          ? `Claim #${claimId} APPROVED! Item marked as handed over.`
          : `Claim #${claimId} rejected.`
      );
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* HEADER */}
      <div className="border-b-4 border-black pb-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#2563EB] text-white border border-black">
            {role === "security" ? "SECURITY OFFICER DESK" : "STUDENT CLAIMS CENTER"}
          </span>
          <h1 className="text-3xl font-black text-black mt-1">
            {role === "security" ? "Custody Verification & Claims Desk" : "Claim an Item in Custody"}
          </h1>
          <p className="text-gray-600 text-xs mt-1">
            {role === "security"
              ? "Review student ownership proofs, verify college identity, and approve property handovers."
              : "Verify ownership of an item found on campus by providing unique identifiable markings or proof."}
          </p>
        </div>
      </div>

      {error && (
        <div className="border-2 border-red-600 bg-red-50 text-red-700 p-3 mb-6 text-sm neo-box font-medium">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="border-2 border-black bg-[#00FF85] text-black p-3 mb-6 text-sm neo-box font-bold">
          ✓ {successMsg}
        </div>
      )}

      {/* STUDENT: FILE A CLAIM FORM */}
      <div className="bg-white border-2 border-black neo-box p-6 mb-8">
        <h2 className="text-xl font-bold text-black mb-1 flex items-center gap-2">
          <span>📝</span> File a New Ownership Claim
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Select an item currently held at the security desk and describe proof that it belongs to you.
        </p>

        <form onSubmit={handleSubmitClaim} className="space-y-4">
          <div>
            <label className="block uppercase font-bold text-xs tracking-wider mb-1.5 text-black">
              SELECT FOUND ITEM IN CUSTODY
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              required
              className="w-full p-2.5 border-2 border-black text-sm font-medium bg-white focus:outline-none"
            >
              <option value="">-- Choose item from custody --</option>
              {foundItems
                .filter((item) => item.status !== "claimed")
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    #{item.id} — {item.title} ({item.category} • Found at: {item.location_found})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block uppercase font-bold text-xs tracking-wider mb-1.5 text-black">
              PROOF OF OWNERSHIP (UNIQUE MARKS, SERIAL NO, COLOR, PASSCODE, ETC.)
            </label>
            <textarea
              rows={3}
              required
              value={proofText}
              onChange={(e) => setProofText(e.target.value)}
              placeholder="e.g. Inside the front zipper is my ID card, and there's a blue keychain with my initials."
              className="w-full p-2.5 border-2 border-black text-sm font-medium bg-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submittingClaim || !selectedItemId || !proofText}
            className="bg-[#2563EB] text-white px-6 py-2.5 border-2 border-black neo-btn font-bold text-xs uppercase tracking-wider"
          >
            {submittingClaim ? "Submitting Claim..." : "Submit Claim for Verification →"}
          </button>
        </form>
      </div>

      {/* CLAIMS LIST / SECURITY REVIEW QUEUE */}
      <div>
        <div className="border-b-2 border-black pb-2 mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-black flex items-center gap-2">
            <span>📋</span> {role === "security" ? "All Submitted Claims Review Queue" : "My Submitted Claims"}
          </h2>
          <span className="text-xs font-mono font-bold bg-gray-100 border border-black px-2 py-0.5">
            Total: {claims.length}
          </span>
        </div>

        {claims.length === 0 ? (
          <div className="bg-white border-2 border-black neo-box p-8 text-center text-sm font-bold text-gray-500">
            No claims currently pending review.
          </div>
        ) : (
          <div className="space-y-4">
            {claims.map((c) => (
              <div
                key={c.id}
                className="bg-white border-2 border-black neo-box p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-black">
                      Claim #{c.id}: {c.found_item_title}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 border border-black ${
                        c.status === "approved"
                          ? "bg-[#00FF85] text-black"
                          : c.status === "rejected"
                          ? "bg-red-500 text-white"
                          : "bg-yellow-300 text-black"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600">
                    Claimed by: <span className="font-bold text-black">{c.claimant_name}</span> ({c.claimant_email}) • {new Date(c.created_at).toLocaleString()}
                  </p>

                  <div className="bg-[#F0F4FF] border border-black p-2.5 text-xs text-gray-800 font-mono mt-2">
                    <span className="font-bold block mb-0.5 text-black">Submitted Proof Description:</span>
                    "{c.proof_description}"
                  </div>

                  {/* VISUAL HANDOVER RECEIPT / CERTIFICATE */}
                  {c.status === "approved" && (
                    <div className="mt-3 p-3 bg-emerald-50 border-2 border-emerald-600 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🤝</span>
                        <div>
                          <span className="font-black text-emerald-800 text-xs uppercase block">
                            Official Custody Handover Complete
                          </span>
                          <span className="text-[11px] text-emerald-700">
                            Ownership verified by Security Desk • Item released to claimant {c.claimant_name}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase bg-emerald-600 text-white px-2 py-1 border border-black">
                        HANDOVER VERIFIED ✓
                      </span>
                    </div>
                  )}

                  {c.status === "pending" && (
                    <div className="mt-2 text-[11px] font-bold text-amber-700 flex items-center gap-1.5">
                      <span>⏳</span>
                      <span>Pending Physical ID & Proof Verification at Campus Security Desk</span>
                    </div>
                  )}
                </div>

                {/* SECURITY ACTION BUTTONS */}
                {role === "security" && c.status === "pending" && (
                  <div className="flex flex-col sm:flex-row gap-2 self-stretch md:self-auto">
                    <button
                      onClick={() => handleResolve(c.id, "approve")}
                      className="bg-[#00FF85] text-black border-2 border-black font-black text-xs uppercase px-4 py-2 neo-btn hover:bg-emerald-400"
                    >
                      ✓ Approve & Hand Over
                    </button>
                    <button
                      onClick={() => handleResolve(c.id, "reject")}
                      className="bg-red-500 text-white border-2 border-black font-black text-xs uppercase px-4 py-2 neo-btn hover:bg-red-600"
                    >
                      ✕ Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


