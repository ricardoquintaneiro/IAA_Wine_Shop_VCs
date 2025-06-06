export default function NavBar({ view, setView }) {
  return (
    <nav className="flex gap-4 mb-4">
      <button
        onClick={() => setView("wallet")}
        className={`px-4 py-2 rounded transition font-semibold ${
          view === "wallet"
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-800 hover:bg-blue-100"
        }`}
      >
        VC Wallet
      </button>
      <button
        onClick={() => setView("verifier")}
        className={`px-4 py-2 rounded transition font-semibold ${
          view === "verifier"
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-800 hover:bg-blue-100"
        }`}
      >
        VC Verifier
      </button>
    </nav>
  );
}