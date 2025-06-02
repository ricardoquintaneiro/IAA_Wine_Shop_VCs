import { useState } from "react"
import WalletView from "./components/Wallet/WalletView"
import VerifierView from "./components/Verifier/VerifierView"
import NavBar from "./components/NavBar"

function App() {
  const [view, setView] = useState("wallet")

  return (
    <div className="p-4 min-w-[320px] max-w-[400px]">
      <NavBar view={view} setView={setView} />
      {view === "wallet" ? <WalletView /> : <VerifierView />}
    </div>
  )
}

export default App
