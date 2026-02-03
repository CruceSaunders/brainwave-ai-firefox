// BrainWave AI - Popup Script

const DAILY_FREE_LIMIT = 5;
const API_ENDPOINT = 'https://brainwave-api.vercel.app/api/generate'; // Will deploy this

let currentAction = 'summarize';
let usageToday = 0;

// Load usage from storage
chrome.storage.local.get(['usageToday', 'usageDate'], (data) => {
  const today = new Date().toDateString();
  if (data.usageDate === today) {
    usageToday = data.usageToday || 0;
  } else {
    // New day, reset usage
    usageToday = 0;
    chrome.storage.local.set({ usageToday: 0, usageDate: today });
  }
  updateUsageBadge();
});

// Action button handlers
document.querySelectorAll('.action-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.action-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentAction = btn.dataset.action;
    updatePlaceholder();
  });
});

function updatePlaceholder() {
  const textarea = document.getElementById('inputText');
  const placeholders = {
    summarize: 'Paste text to summarize, or select text on the page...',
    rewrite: 'Paste text to rewrite in a better way...',
    explain: 'Paste complex text to get a simple explanation...',
    translate: 'Paste text to translate (specify target language in the text)...'
  };
  textarea.placeholder = placeholders[currentAction] || placeholders.summarize;
}

function updateUsageBadge() {
  const badge = document.getElementById('usageBadge');
  const remaining = DAILY_FREE_LIMIT - usageToday;
  badge.textContent = `${remaining}/${DAILY_FREE_LIMIT} free`;
  if (remaining <= 1) {
    badge.classList.add('low');
  }
  if (remaining <= 0) {
    document.getElementById('upgradeBanner').classList.add('visible');
    document.getElementById('submitBtn').disabled = true;
  }
}

// Get selected text from page
async function getSelectedText() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection().toString()
    });
    return result || '';
  } catch (e) {
    return '';
  }
}

// Auto-fill with selected text on load
getSelectedText().then(text => {
  if (text) {
    document.getElementById('inputText').value = text;
  }
});

// Submit handler
document.getElementById('submitBtn').addEventListener('click', async () => {
  const inputText = document.getElementById('inputText').value.trim();
  
  if (!inputText) {
    alert('Please enter or select some text first.');
    return;
  }

  if (usageToday >= DAILY_FREE_LIMIT) {
    document.getElementById('upgradeBanner').classList.add('visible');
    return;
  }

  const submitBtn = document.getElementById('submitBtn');
  const loading = document.getElementById('loading');
  const resultArea = document.getElementById('resultArea');
  
  submitBtn.disabled = true;
  loading.classList.add('visible');
  resultArea.classList.remove('visible');

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: currentAction,
        text: inputText
      })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    
    // Update usage
    usageToday++;
    chrome.storage.local.set({ usageToday, usageDate: new Date().toDateString() });
    updateUsageBadge();

    // Show result
    document.getElementById('resultText').textContent = data.result;
    resultArea.classList.add('visible');

  } catch (error) {
    alert('Something went wrong. Please try again.');
    console.error(error);
  } finally {
    submitBtn.disabled = usageToday >= DAILY_FREE_LIMIT;
    loading.classList.remove('visible');
  }
});

// Copy button handler
document.getElementById('copyBtn').addEventListener('click', () => {
  const resultText = document.getElementById('resultText').textContent;
  navigator.clipboard.writeText(resultText).then(() => {
    document.getElementById('copyBtn').textContent = '✓ Copied!';
    setTimeout(() => {
      document.getElementById('copyBtn').textContent = '📋 Copy to Clipboard';
    }, 2000);
  });
});
