import { useState, useEffect } from "react";
import AddCredential from "./AddCredential";

function getStorage() {
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    return {
      get: (key, cb) => chrome.storage.local.get([key], (result) => cb(result[key] || [])),
      set: (key, value) => chrome.storage.local.set({ [key]: value }),
      remove: (key) => chrome.storage.local.remove(key),
    };
  } else {
    return {
      get: (key, cb) => cb(JSON.parse(localStorage.getItem(key) || "[]")),
      set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
      remove: (key) => localStorage.removeItem(key),
    };
  }
}

const storage = getStorage();

export default function WalletView() {
  const [credentials, setCredentials] = useState([]);

  // Load credentials from storage
  const loadCredentials = () => {
    storage.get("credentials", setCredentials);
  };

  useEffect(() => {
    loadCredentials();
  }, []);


  useEffect(() => {
    const onFocus = () => loadCredentials();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);


  const handleRemove = (id) => {
    storage.get("credentials", (credentials) => {
      const updated = credentials.filter(vc => vc.id !== id);
      storage.set("credentials", updated);
      storage.remove(`proofs:${id}`);
      setCredentials(updated);
    });
  };

  const handleGenerateProof = async (vc) => {
    const birthTimestamp = Math.floor(new Date(vc.credentialSubject.dateOfBirth).getTime() / 1000);
    const currentTimestamp = Math.floor(Date.now() / 1000);

    const input = { birthTimestamp, currentTimestamp };

    try {
      const response = await fetch('http://localhost:3001/generate-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const { proof, publicSignals } = await response.json();
      storage.set(`proofs:${vc.id}`, { proof, publicSignals });
      alert("Proof generated and stored!");
    } catch (err) {
      alert("Proof generation failed: " + err.message);
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} - ${hours}:${minutes}`;
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Your Verifiable Credentials</h2>
      {credentials.length === 0 ? (
        <p className="text-gray-500">No credentials stored yet.</p>
      ) : (
        <ul className="space-y-2">
          {credentials.map(vc => {
            const hasProof = !!localStorage.getItem(`proofs:${vc.id}`);
            return (
              <li
                key={vc.id}
                className="bg-white rounded shadow p-3 border border-gray-200 flex justify-between items-center"
              >
                <div>
                  <strong className="text-blue-700 break-all">{vc.id}</strong>
                  <span className="text-gray-700 ml-2">from {vc.credentialSubject?.clientName}</span>
                  <ul className="mt-2 text-sm text-gray-700 space-y-1">
                    <li>
                      <span className="font-medium text-gray-600">Issued:</span>{" "}
                      <span>{vc.issuanceDate ? formatDate(vc.issuanceDate) : "N/A"}</span>
                    </li>
                    <li>
                      <span className="font-medium text-gray-600">Expires:</span>{" "}
                      <span>{vc.expirationDate ? formatDate(vc.expirationDate) : "N/A"}</span>
                    </li>
                  </ul>
                </div>
                <div>
                  {hasProof && <span className="ml-2 text-green-600">Proof generated</span>}
                  <button
                    onClick={() => handleRemove(vc.id)}
                    className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    Remove
                  </button>
                  <button
                    onClick={() => handleGenerateProof(vc)}
                    className="ml-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                  >
                    Generate Proof
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <AddCredential onChange={loadCredentials} />
    </div>
  );
}