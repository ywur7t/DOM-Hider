chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "elementPicked") {
    chrome.storage.local.set({
      lastPicked: {
        selector: message.selector,
        url: message.url
      }
    }, () => {
      // Открываем popup
      chrome.action.openPopup();
    });
  }
});
