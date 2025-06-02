import React, { useState } from "react";

export default function AddCredential({ onAdd }) {
  const [type, setType] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issued, setIssued] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!type || !issuer || !issued) return;
    onAdd({
      id: Date.now(),
      type,
      issuer,
      issued,
    });
    setType("");
    setIssuer("");
    setIssued("");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 bg-white rounded shadow p-4 border border-gray-200">
      <h3 className="text-lg font-semibold mb-2">Add Credential</h3>
      <div>
        <input
          type="text"
          placeholder="Type"
          value={type}
          onChange={e => setType(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-400"
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Issuer"
          value={issuer}
          onChange={e => setIssuer(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-400"
        />
      </div>
      <div>
        <input
          type="date"
          placeholder="Issued Date"
          value={issued}
          onChange={e => setIssued(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-400"
        />
      </div>
      <button
        type="submit"
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Add
      </button>
    </form>
  );
}