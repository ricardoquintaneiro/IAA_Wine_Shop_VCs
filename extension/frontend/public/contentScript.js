chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "AGE_PROOF" && message.proofObj) {
    localStorage.setItem("ageProof", JSON.stringify(message.proofObj));
    sendResponse({ status: "ok" });
  }
});