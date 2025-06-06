import { useState } from "react";

export default function AddCredential({ onChange }) {
  const [error, setError] = useState("");

  // Use chrome.storage.local if available, otherwise fallback to localStorage
  const saveCredential = (newCred) => {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['credentials'], (result) => {
        const credentials = result.credentials || [];
        const updated = [...credentials, newCred];
        chrome.storage.local.set({ credentials: updated }, () => {
          if (chrome.runtime.lastError) {
            setError("Failed to save credential: " + chrome.runtime.lastError.message);
            return;
          }
          if (onChange) onChange();
          window.close(); // Always try to close the window
        });
      });
    } else {
      try {
        const saved = localStorage.getItem("credentials");
        const credentials = saved ? JSON.parse(saved) : [];
        const updated = [...credentials, newCred];
        localStorage.setItem("credentials", JSON.stringify(updated));
        if (onChange) onChange();
      } catch (err) {
        setError("Failed to save credential to localStorage.");
      }
    }
  };

  const handleFileChange = async (e) => {
    setError("");
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      if (!json.id) throw new Error("Missing credential id");
      saveCredential(json);
    } catch (err) {
      setError("Invalid JSON file.");
      console.error("Credential import error:", err);
    }
    e.target.value = ""; // Reset file input
  };

  return (
    <form className="mt-4 space-y-3 bg-white rounded shadow p-4 border border-gray-200">
      <h3 className="text-lg font-semibold mb-2">Add Credential</h3>
      <div className="mt-4">
        <label className="block mb-1 font-medium">Import from JSON file:</label>
        <input
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
    </form>
  );
}