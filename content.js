chrome.storage.sync.get({rules: []}, (data) => {
  applyRules(data.rules);
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "applyRules") {
    applyRules(request.rules);
  }
});
function applyRules(rules) {
  const currentHost = window.location.hostname;
  const hideElements = () => {
    rules.forEach(rule => {
      if (currentHost.includes(rule.websiteUrl) || 
          rule.websiteUrl === '*' || 
          rule.websiteUrl === currentHost) {
        try {
          const elements = document.querySelectorAll(rule.elementSelector);
          elements.forEach(el => {
            el.style.display = 'none';
          });
        } catch (e) {
        }
      }
    });
  };
  hideElements();
  setInterval(hideElements, 1000);
}

chrome.storage.local.get('hideCSS', ({ hideCSS }) => {
  if (hideCSS) {
    const style = document.createElement('style');
    style.textContent = hideCSS;
    document.documentElement.appendChild(style);
  }
});
