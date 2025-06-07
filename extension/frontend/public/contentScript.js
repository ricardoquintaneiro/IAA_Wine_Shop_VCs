chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "AGE_PROOF" && message.proofObj) {
    localStorage.setItem("ageProof", JSON.stringify(message.proofObj));
    sendResponse({ status: "ok" });
  } else if (message.type === "GET_WINE_VPS") {
    // Gather all wine_verification_* entries from localStorage
    const wineVps = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("wine_verification_")) {
        try {
          wineVps.push(JSON.parse(localStorage.getItem(key)));
        } catch {}
      }
    }
    sendResponse({ wineVps });
  }
});