// BrainWave AI - Content Script

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'BRAINWAVE_PROCESS') {
    showInlineResult(request.action, request.text);
  }
});

// Create and show inline result popup
async function showInlineResult(action, text) {
  // Remove any existing popup
  const existing = document.getElementById('brainwave-popup');
  if (existing) existing.remove();

  // Create popup container
  const popup = document.createElement('div');
  popup.id = 'brainwave-popup';
  popup.innerHTML = `
    <div class="brainwave-header">
      <span class="brainwave-logo">🧠 BrainWave AI</span>
      <button class="brainwave-close">×</button>
    </div>
    <div class="brainwave-content">
      <div class="brainwave-loading">
        <div class="brainwave-spinner"></div>
        <span>Processing...</span>
      </div>
      <div class="brainwave-result" style="display: none;"></div>
    </div>
    <div class="brainwave-actions" style="display: none;">
      <button class="brainwave-copy">📋 Copy</button>
      <button class="brainwave-replace">↩️ Replace Selection</button>
    </div>
  `;

  document.body.appendChild(popup);

  // Position near selection
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    popup.style.top = `${window.scrollY + rect.bottom + 10}px`;
    popup.style.left = `${Math.max(10, rect.left)}px`;
  }

  // Close button handler
  popup.querySelector('.brainwave-close').addEventListener('click', () => {
    popup.remove();
  });

  // Make API call
  try {
    const response = await fetch('https://brainwave-api.vercel.app/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, text })
    });

    if (!response.ok) throw new Error('API error');

    const data = await response.json();
    
    // Show result
    popup.querySelector('.brainwave-loading').style.display = 'none';
    popup.querySelector('.brainwave-result').style.display = 'block';
    popup.querySelector('.brainwave-result').textContent = data.result;
    popup.querySelector('.brainwave-actions').style.display = 'flex';

    // Copy button
    popup.querySelector('.brainwave-copy').addEventListener('click', () => {
      navigator.clipboard.writeText(data.result);
      popup.querySelector('.brainwave-copy').textContent = '✓ Copied!';
    });

    // Replace selection button
    popup.querySelector('.brainwave-replace').addEventListener('click', () => {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(data.result));
        popup.remove();
      }
    });

  } catch (error) {
    popup.querySelector('.brainwave-loading').innerHTML = `
      <span style="color: #ff6b6b;">❌ Error: ${error.message}</span>
    `;
  }
}

// Keyboard shortcut: Ctrl/Cmd + Shift + B to process selected text
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText) {
      showInlineResult('summarize', selectedText);
    }
  }
});
