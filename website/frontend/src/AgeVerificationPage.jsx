import { useEffect, useState } from "react";
import { Spinner } from "@heroui/react";
import { useNavigate } from "react-router-dom";

export default function AgeGate() {
  const navigate = useNavigate();
  const [waitingForProof, setWaitingForProof] = useState(true); // Start waiting immediately
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  // Poll for proof in localStorage
  useEffect(() => {
    let interval;
    if (waitingForProof) {
      interval = setInterval(() => {
        const proofData = localStorage.getItem("ageProof");
        if (proofData) {
          setVerifying(true);
          setWaitingForProof(false);
          verifyProof(JSON.parse(proofData));
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [waitingForProof]);

  const verifyProof = async ({ proof, publicSignals }) => {
    try {
      const response = await fetch("http://localhost:3002/verify-proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proof, publicSignals }),
      });
      const { verified } = await response.json();
      // Check both: proof is valid AND publicSignals[0] indicates of-age
      if (verified && publicSignals && publicSignals[0] === "1") {
        localStorage.setItem("ageVerified", "true");
        navigate("/shop");
      } else {
        setError("You are not of legal age or the proof is invalid.");
        setVerifying(false);
      }
    } catch (err) {
      setError("Verification error: " + err.message);
      setVerifying(false);
    }
  };

  // Always show spinner and instructions while waiting or verifying
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Spinner size="lg" />
      <p className="mt-4 text-lg text-gray-700">
        {verifying
          ? "Verifying proof..."
          : "Waiting for proof from VC Wallet extension..."}
      </p>
      <div className="text-center mt-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Age Verification Required
        </h1>
        <p className="text-gray-600 mb-6">
          To access this wine shop, please generate and send a proof of age using your VC Wallet extension.
        </p>
        <h2 className="text-2xl font-semibold text-purple-600">
          Step 1: Open your VC Wallet extension, generate a proof and send it.
        </h2>
        <h2 className="text-2xl font-semibold text-purple-600 mt-2">
          Step 2: Wait for automatic verification.
        </h2>
        {error && <p className="text-red-600 mt-4">{error}</p>}
        <p className="text-xs text-gray-500 text-center mt-6">
          By verifying, you confirm that you are of legal drinking age in your country.
        </p>
      </div>
    </div>
  );
}