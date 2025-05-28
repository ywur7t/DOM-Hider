document.getElementById('website-url').addEventListener('blur', saveFields);
document.getElementById('element-selector').addEventListener('blur', saveFields);
function saveFields() {
  const websiteUrl = document.getElementById('website-url').value.trim();
  const elementSelector = document.getElementById('element-selector').value.trim();
  chrome.storage.local.set({ 
    lastFields: { websiteUrl, elementSelector } 
  });
}
function loadRules() {
  chrome.storage.sync.get({rules: []}, (data) => {
    updateRulesList(data.rules);
  });
}
function restoreFields() {
  chrome.storage.local.get(['lastFields'], function(result) {
    if (result.lastFields) {
      document.getElementById('website-url').value = result.lastFields.websiteUrl || '';
      document.getElementById('element-selector').value = result.lastFields.elementSelector || '';
    }
  });
}
document.addEventListener('DOMContentLoaded', function() {
  restoreFields();
  loadRules();
});
document.getElementById('add-rule').addEventListener('click', () => {
  const websiteUrl = document.getElementById('website-url').value.trim();
  const elementSelector = document.getElementById('element-selector').value.trim();
  if (!websiteUrl || !elementSelector) {
    alert('Please enter both website URL and element selector');
    return;
  }
  chrome.storage.sync.get({rules: []}, (data) => {
    const newRules = [...data.rules, {websiteUrl, elementSelector}];
    chrome.storage.sync.set({rules: newRules}, () => {
      updateRulesList(newRules);
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {action: "applyRules", rules: newRules});
      });
    });
  });
});
function updateRulesList(rules) {
  const rulesList = document.getElementById('rules-list');
  rulesList.innerHTML = '';
  rules.forEach((rule, index) => {
    const ruleItem = document.createElement('div');
    ruleItem.className = 'rule-item';
    ruleItem.innerHTML = `
      <span title="${rule.websiteUrl}: ${rule.elementSelector}">
        ${rule.websiteUrl}: ${rule.elementSelector}
      </span>
      <span class="remove-rule" data-index="${index}">remove</span>
    `;
    rulesList.appendChild(ruleItem);
  });
  document.querySelectorAll('.remove-rule').forEach(button => {
    button.addEventListener('click', (e) => {
      const index = parseInt(e.target.getAttribute('data-index'));
      const newRules = rules.filter((_, i) => i !== index);
      chrome.storage.sync.set({rules: newRules}, () => {
        updateRulesList(newRules);
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, {action: "applyRules", rules: newRules});
        });
      });
    });
  });
}
chrome.storage.sync.get({rules: []}, (data) => {
  updateRulesList(data.rules);
});
document.addEventListener('DOMContentLoaded', function() {
  restoreFields();
  loadRules();
  chrome.storage.local.get(['lastPicked'], function(result) {
    if (result.lastPicked) {
      let { url, selector } = result.lastPicked;
      document.getElementById('website-url').value = new URL(url).hostname;
      // document.getElementById('element-selector').value = selector;
      if (selector.endsWith('.highlight_cursor_pointer')) {
          selector = selector.slice(0, -'.highlight_cursor_pointer'.length);
      }
      document.getElementById('element-selector').value = selector;
      saveFields();
      chrome.storage.local.remove(['lastPicked']);
    }
  });
});
document.getElementById('pick-element').addEventListener('click', startElementSelection);
let selectionActive = false;
function startElementSelection() {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.scripting.executeScript({
      target: {tabId: tabs[0].id},
      files: ['content-picker.js']
    }, () => {
      selectionActive = true;
      window.close();
    });
  });
}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "elementPicked" && selectionActive) {
    selectionActive = false;
    document.getElementById('website-url').value = new URL(request.url).hostname;
    // document.getElementById('element-selector').value = request.selector;
    let selector = request.selector;
    if (selector.endsWith('.highlight_cursor_pointer')) {
        selector = selector.slice(0, -'.highlight_cursor_pointer'.length);
    }
    document.getElementById('element-selector').value = selector;
    saveFields();
  }
});