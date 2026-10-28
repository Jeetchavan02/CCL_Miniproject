import { CheckIcon, HandshakeIcon } from "./Icons";

export default function MatchCard({ lostItem, matches = [], foundItems = {} }) {
  const isResolved = lostItem.status === "resolved";

  return (
    <div className={`border-2 border-black neo-box p-6 mb-6 ${isResolved ? "bg-[#F0FDF4]" : "bg-white"}`}>
      {/* Handover Resolved Banner */}
      {isResolved && (
        <div className="border-2 border-black bg-[#00FF85] text-black px-4 py-2 mb-4 font-black text-xs uppercase tracking-wider flex items-center gap-2">
          <CheckIcon className="w-4 h-4 text-black" />
          <span>Handover Complete — Item Successfully Collected From Campus Security Desk</span>
        </div>
      )}

      {/* Lost Item Header */}
      <div className="border-b-2 border-black pb-4 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold bg-[#F0F4FF] border border-black px-2 py-0.5 text-[#2563EB]">
            {lostItem.category}
          </span>
          <h3 className="text-2xl font-bold text-black mt-1">{lostItem.title}</h3>
          <p className="text-gray-600 text-sm mt-0.5">
            Lost at: <span className="font-semibold text-black">{lostItem.location_lost}</span> • {new Date(lostItem.date_lost).toLocaleDateString()}
          </p>
        </div>
        <span
          className={`self-start md:self-auto text-xs uppercase font-bold px-3 py-1 border-2 border-black ${
            isResolved ? "bg-[#00FF85] text-black font-black" : "bg-gray-100 text-black"
          }`}
        >
          Status: {lostItem.status}
        </span>
      </div>

      {lostItem.description && (
        <p className="text-sm text-gray-700 mb-6 bg-gray-50 border border-black p-3">
          "{lostItem.description}"
        </p>
      )}

      {/* Matches List */}
      <div className="space-y-4">
        <h4 className="font-bold text-sm uppercase tracking-wider text-black">
          Potential Matches ({matches.length})
        </h4>

        {matches.length === 0 ? (
          <p className="text-sm italic text-gray-500 py-2">
            No matches found yet. We will notify you when a matching item is turned in.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {matches.map((match) => {
              const found = foundItems[match.found_item_id];
              const score = match.confidence_score;
              const isHigh = score >= 70;

              return (
                <div
                  key={match.id}
                  className="border-2 border-black p-4 bg-[#F0F4FF] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h5 className="font-bold text-lg text-black">
                        {found ? found.title : `Found Item #${match.found_item_id}`}
                      </h5>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 border-2 border-black ${
                          isHigh ? "bg-[#00FF85] text-black" : "bg-[#FFD60A] text-black"
                        }`}
                      >
                        {score}% Match
                      </span>
                    </div>

                    {found && (
                      <p className="text-xs text-gray-600 mt-1">
                        Found at: <span className="font-semibold text-black">{found.location_found}</span> • {new Date(found.date_found).toLocaleDateString()}
                      </p>
                    )}
                    {found && found.description && (
                      <p className="text-xs text-gray-700 mt-1 italic">
                        "{found.description}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {found && found.presigned_url && (
                      <a
                        href={found.presigned_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white border-2 border-black px-3 py-1.5 text-xs font-bold neo-btn text-black hover:bg-gray-100"
                      >
                        View Photo
                      </a>
                    )}
                    {found && (
                      found.status === "claimed" || isResolved ? (
                        <span className="bg-[#00FF85] text-black border-2 border-black px-3 py-1.5 text-xs font-black uppercase tracking-wider flex items-center gap-1">
                          <CheckIcon className="w-3.5 h-3.5" />
                          Handed Over
                        </span>
                      ) : (
                        <a
                          href={`/claims?item_id=${found.id}`}
                          className="bg-[#2563EB] text-white border-2 border-black px-3 py-1.5 text-xs font-bold neo-btn hover:bg-blue-700 flex items-center gap-1"
                        >
                          <HandshakeIcon className="w-3.5 h-3.5" />
                          Claim Item
                        </a>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
