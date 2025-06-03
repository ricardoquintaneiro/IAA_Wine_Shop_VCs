import { useState } from "react";

export default function AddCredential({ onChange }) {
  const [error, setError] = useState("");

  const saveToLocalStorage = (newCred) => {
    const saved = localStorage.getItem("credentials");
    const credentials = saved ? JSON.parse(saved) : [];
    const updated = [...credentials, newCred];
    localStorage.setItem("credentials", JSON.stringify(updated));
  };

  const handleFileChange = async (e) => {
    setError("");
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      saveToLocalStorage(json);
      if (onChange) onChange();
    } catch (err) {
      setError("Invalid JSON file.");
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