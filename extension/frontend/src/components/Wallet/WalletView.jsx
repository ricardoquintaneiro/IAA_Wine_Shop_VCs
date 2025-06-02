import { useState } from "react";

export default function WalletView() {
  // Example state for holding VCs
  const [credentials, setCredentials] = useState([
    // Example placeholder data
  ]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Your Verifiable Credentials</h2>
      {credentials.length === 0 ? (
        <p className="text-gray-500">No credentials stored yet.</p>
      ) : (
        <ul className="space-y-2">
          {credentials.map(vc => (
            <li
              key={vc.id}
              className="bg-white rounded shadow p-3 border border-gray-200"
            >
              <strong className="text-blue-700">{vc.type}</strong> from{" "}
              <span className="text-gray-700">{vc.issuer}</span> (issued:{" "}
              <span className="text-gray-500">{vc.issued}</span>)
            </li>
          ))}
        </ul>
      )}
      {/* Placeholder for adding/importing credentials */}
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        onClick={() => alert("Add/import credential functionality coming soon!")}
      >
        Add/Import Credential
      </button>
    </div>
  );
}