// Apply rules when page loads
chrome.storage.sync.get({rules: []}, (data) => {
  applyRules(data.rules);
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "applyRules") {
    applyRules(request.rules);
  }
});

// function applyRules(rules) {
//   const currentHost = window.location.hostname;
  
//   rules.forEach(rule => {
//     // Check if the current website matches the rule (simple contains check)
//     if (currentHost.includes(rule.websiteUrl) || 
//         rule.websiteUrl === '*' || 
//         rule.websiteUrl === currentHost) {
      
//       try {
//         const elements = document.querySelectorAll(rule.elementSelector);
//         elements.forEach(el => {
//           el.style.display = 'none';
//         });
//       } catch (e) {
//         console.error('Error hiding element:', e);
//       }
//     }
//   });
// }












function applyRules(rules) {
  const currentHost = window.location.hostname;
  
  // Функция для скрытия элементов
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
          console.error('Error hiding element:', e);
        }
      }
    });
  };

  // Выполнить сразу и каждую секунду (для динамических элементов)
  hideElements();
  setInterval(hideElements, 1000);
}