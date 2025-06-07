import { useState, useEffect } from "react";

export default function VerifyProduct() {
  const [wineVps, setWineVps] = useState([]);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedVp, setSelectedVp] = useState(null);

  // Fetch wine VPs from website localStorage via content script
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (!tabId) return;
      chrome.tabs.sendMessage(tabId, { type: "GET_WINE_VPS" }, (response) => {
        if (response && response.wineVps) setWineVps(response.wineVps);
      });
    });
  }, []);

  const handleVerify = async (vpObj) => {
    setVerifying(true);
    setResult(null);
    setSelectedVp(vpObj);

    const { storedAt, wineVP, ...vpToSend } = vpObj;

    try {
      const response = await fetch("http://localhost:3000/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verifiablePresentation: vpToSend }),
      });
      if (!response.ok) {
        setResult({ verified: false });
        return;
      }
      setResult({ verified: true });
    } catch (err) {
      setResult({ verified: false });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <>
      {wineVps.length === 0 ? (
        <div className="text-gray-500">No wine products found in website localStorage.</div>
      ) : (
        <ul className="space-y-2 mb-4">
          {wineVps.map((vp, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <span className="flex-1 truncate">
                {vp.credentialSubject?.productName || vp.wineVP || `Wine VP #${idx + 1}`}
              </span>
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                disabled={verifying}
                onClick={() => handleVerify(vp)}
              >
                {verifying && selectedVp === vp ? "Verifying..." : "Verify"}
              </button>
            </li>
          ))}
        </ul>
      )}
      {result && (
        <div className={`mt-4 p-3 rounded border font-semibold ${
          result.verified
            ? "bg-green-100 text-green-800 border-green-300"
            : "bg-red-100 text-red-800 border-red-300"
        }`}>
          {result.verified ? "Verified!" : "Not verified."}
        </div>
      )}
    </>
  );
}