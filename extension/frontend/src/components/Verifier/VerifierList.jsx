import { useEffect, useState } from "react";

export default function WineVerifierList() {
  const [wineVps, setWineVps] = useState([]);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (!tabId) return;
      chrome.tabs.sendMessage(tabId, { type: "GET_WINE_VPS" }, (response) => {
        if (response && response.wineVps) setWineVps(response.wineVps);
      });
    });
  }, []);

  return (
    <div>
      <h2>Wine Products to Verify</h2>
      <ul>
        {wineVps.map((vp, idx) => (
          <li key={idx}>
            <button onClick={() => verifyWineVP(vp)}>
              {vp.credentialSubject?.productName || vp.wineVP}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// You would implement verifyWineVP to POST to your verifier service.