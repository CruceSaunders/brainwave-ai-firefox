// BrainWave AI - Background Service Worker

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  // Create context menu items for selected text
  chrome.contextMenus.create({
    id: 'brainwave-summarize',
    title: '🧠 Summarize with BrainWave',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'brainwave-rewrite',
    title: '✨ Rewrite with BrainWave',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'brainwave-explain',
    title: '💡 Explain with BrainWave',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'brainwave-translate',
    title: '🌐 Translate with BrainWave',
    contexts: ['selection']
  });

  console.log('BrainWave AI extension installed');
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const action = info.menuItemId.replace('brainwave-', '');
  const selectedText = info.selectionText;

  if (selectedText) {
    // Send message to content script to show inline result
    chrome.tabs.sendMessage(tab.id, {
      type: 'BRAINWAVE_PROCESS',
      action: action,
      text: selectedText
    });
  }
});

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GENERATE') {
    handleGenerate(request.action, request.text)
      .then(result => sendResponse({ success: true, result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }
});

async function handleGenerate(action, text) {
  const API_ENDPOINT = 'https://brainwave-api.vercel.app/api/generate';
  
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ action, text })
  });

  if (!response.ok) {
    throw new Error('API request failed');
  }

  const data = await response.json();
  return data.result;
}
