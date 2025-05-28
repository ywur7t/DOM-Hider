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
      <span>${rule.websiteUrl}: ${rule.elementSelector}</span>
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