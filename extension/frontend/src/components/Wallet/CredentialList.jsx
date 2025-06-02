import React from "react";

export default function CredentialList({ credentials, onRemove }) {
  if (!credentials.length) {
    return <p className="text-gray-500">No credentials stored yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {credentials.map(vc => (
        <li
          key={vc.id}
          className="flex items-center justify-between bg-white rounded shadow p-3 border border-gray-200"
        >
          <div>
            <div className="font-semibold text-blue-700">{vc.type}</div>
            <div className="text-sm text-gray-600">
              Issuer: {vc.issuer}
            </div>
            <div className="text-xs text-gray-400">
              Issued: {vc.issued}
            </div>
          </div>
          {onRemove && (
            <button
              className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
              onClick={() => onRemove(vc.id)}
              title="Remove credential"
            >
              Remove
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}