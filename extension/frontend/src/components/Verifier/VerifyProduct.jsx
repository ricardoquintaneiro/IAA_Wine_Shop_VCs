import { useState } from "react";

export default function VerifyProduct() {
  const [vcInput, setVcInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setResult(null);
    setError("");

    try {
      // TODO: Replace this URL with our actual verifier API endpoint
      const response = await fetch("https://our-verifier-api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vc: vcInput }),
      });
      if (!response.ok) {
        throw new Error("Verification failed");
      }
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Verification error");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="p-2">
      <h2 className="text-lg font-bold mb-2">Verify Product VC</h2>
      <form onSubmit={handleVerify} className="flex flex-col gap-2">
        <textarea
          className="border rounded p-2 text-sm"
          rows={4}
          placeholder="Paste product VC JSON here"
          value={vcInput}
          onChange={e => setVcInput(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          disabled={verifying}
        >
          {verifying ? "Verifying..." : "Verify"}
        </button>
      </form>
      {result && (
        <div className="mt-4 p-3 rounded bg-green-100 text-green-800 border border-green-300">
          <div className="font-semibold">Verification Result:</div>
          <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
      {error && (
        <div className="mt-4 p-3 rounded bg-red-100 text-red-800 border border-red-300">
          {error}
        </div>
      )}
    </div>
  );
}