import { useState } from "react";

export default function VerifyProduct() {
  const [vpInput, setVcInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setResult(null);
    setError("");

    try {
      const vpObj = JSON.parse(vpInput);

      const response = await fetch("http://localhost:3000/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verifiablePresentation: vpObj }),
      });
      if (!response.ok) {
        throw new Error("Verification failed");
      }
      const data = await response.json();
      console.log("Verification result:", data);
      setResult(data);
    } catch (err) {
      setError(err.message || "Verification error");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="p-2">
      <h2 className="text-lg font-bold mb-2">Verify Product VP</h2>
      <form onSubmit={handleVerify} className="flex flex-col gap-2">
        <textarea
          className="border rounded p-2 text-sm"
          rows={4}
          placeholder="Paste product VP JSON here"
          value={vpInput}
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