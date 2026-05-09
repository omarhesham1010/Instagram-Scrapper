// Background service worker for Instagram Activity Dashboard
chrome.runtime.onInstalled.addListener(() => {
  console.log("Instagram Activity Dashboard installed");
});

// Listener for messages from the Next.js frontend or content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_SESSION") {
    // Logic to check cookies or pass messages to content script
    sendResponse({ success: true, message: "Background script is active" });
  }
  return true; // Keep the message channel open for asynchronous response
});
