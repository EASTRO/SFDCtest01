// Salesforce Assistant - Chrome Extension
// Background Service Worker

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Salesforce Assistant extension installed');

    // Set default values
    chrome.storage.local.set({
      conversationHistory: [],
      installDate: new Date().toISOString()
    });
  } else if (details.reason === 'update') {
    console.log('Salesforce Assistant extension updated');
  }
});

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'clearHistory') {
    chrome.storage.local.set({ conversationHistory: [] }, () => {
      sendResponse({ success: true });
    });
    return true; // Keep the message channel open for async response
  }

  if (request.action === 'getHistory') {
    chrome.storage.local.get(['conversationHistory'], (result) => {
      sendResponse({ history: result.conversationHistory || [] });
    });
    return true;
  }
});

// Optional: Add context menu for quick access
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'askSalesforceAssistant',
    title: 'Ask Salesforce Assistant about "%s"',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'askSalesforceAssistant') {
    // Store the selected text for the popup to use
    chrome.storage.local.set({
      pendingQuestion: info.selectionText
    });

    // Open the popup
    chrome.action.openPopup();
  }
});
