import React from "react";

export default function Spinner() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 bg-[#2563EB] border-2 border-black neo-box animate-spin-box"></div>
      <p className="font-bold text-lg tracking-wider text-black">Loading...</p>
    </div>
  );
}
