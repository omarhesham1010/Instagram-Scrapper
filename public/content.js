// Content script injected into instagram.com
console.log("Instagram Activity Dashboard - Content Script Loaded");

// Listen for messages from background script or extension popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "EXTRACT_DATA") {
    // We will extract DOM or local data here
    sendResponse({ success: true, data: {} });
  }
  return true;
});
