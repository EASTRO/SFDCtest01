// Salesforce Assistant - Chrome Extension
// Popup JavaScript

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

const SYSTEM_PROMPT = `You are a friendly Salesforce helper for sales reps. Keep answers simple and easy to follow.

IMPORTANT RULES:
- Use plain, everyday language (no technical jargon)
- Keep answers SHORT (2-4 sentences when possible)
- Give step-by-step instructions with numbered steps
- Focus on clicks and buttons, not code
- If something is complex, just tell them to ask their Salesforce admin

You help with everyday sales tasks like:
- Finding and updating contacts, accounts, and leads
- Creating and managing opportunities
- Logging calls and emails
- Running reports
- Using dashboards
- Basic navigation in Salesforce

Example response style:
"To add a new contact: 1) Click the + icon at the top, 2) Select 'Contact', 3) Fill in the name and email, 4) Click Save."

Be encouraging and patient. If you don't understand what they need, ask a simple clarifying question.`;

// DOM Elements
let settingsBtn, settingsPanel, saveSettingsBtn, cancelSettingsBtn;
let apiKeyInput, chatContainer, messagesContainer, welcomeMessage;
let userInput, sendBtn;

// State
let conversationHistory = [];
let isLoading = false;
let apiKey = '';

// Initialize
document.addEventListener('DOMContentLoaded', init);

function init() {
  // Get DOM elements
  settingsBtn = document.getElementById('settingsBtn');
  settingsPanel = document.getElementById('settingsPanel');
  saveSettingsBtn = document.getElementById('saveSettings');
  cancelSettingsBtn = document.getElementById('cancelSettings');
  apiKeyInput = document.getElementById('apiKey');
  chatContainer = document.getElementById('chatContainer');
  messagesContainer = document.getElementById('messages');
  welcomeMessage = document.getElementById('welcomeMessage');
  userInput = document.getElementById('userInput');
  sendBtn = document.getElementById('sendBtn');

  // Load saved API key
  loadApiKey();

  // Event listeners
  settingsBtn.addEventListener('click', openSettings);
  saveSettingsBtn.addEventListener('click', saveSettings);
  cancelSettingsBtn.addEventListener('click', closeSettings);
  sendBtn.addEventListener('click', sendMessage);
  userInput.addEventListener('keydown', handleKeyDown);
  userInput.addEventListener('input', autoResizeTextarea);

  // Close settings on outside click
  settingsPanel.addEventListener('click', (e) => {
    if (e.target === settingsPanel) {
      closeSettings();
    }
  });
}

// API Key Management
async function loadApiKey() {
  try {
    const result = await chrome.storage.local.get(['anthropicApiKey']);
    if (result.anthropicApiKey) {
      apiKey = result.anthropicApiKey;
      apiKeyInput.value = apiKey;
    }
  } catch (error) {
    console.error('Error loading API key:', error);
  }
}

async function saveApiKey(key) {
  try {
    await chrome.storage.local.set({ anthropicApiKey: key });
    apiKey = key;
  } catch (error) {
    console.error('Error saving API key:', error);
    throw error;
  }
}

// Settings Panel
function openSettings() {
  settingsPanel.classList.remove('hidden');
  apiKeyInput.focus();
}

function closeSettings() {
  settingsPanel.classList.add('hidden');
  apiKeyInput.value = apiKey; // Reset to saved value
}

async function saveSettings() {
  const newApiKey = apiKeyInput.value.trim();

  if (!newApiKey) {
    showError('Please enter an API key');
    return;
  }

  try {
    await saveApiKey(newApiKey);
    closeSettings();
  } catch (error) {
    showError('Failed to save API key');
  }
}

// Message Handling
function handleKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function autoResizeTextarea() {
  userInput.style.height = 'auto';
  userInput.style.height = Math.min(userInput.scrollHeight, 100) + 'px';
}

async function sendMessage() {
  const message = userInput.value.trim();

  if (!message || isLoading) return;

  // Check for API key
  if (!apiKey) {
    openSettings();
    showError('Please configure your API key first');
    return;
  }

  // Hide welcome message
  if (welcomeMessage) {
    welcomeMessage.classList.add('hidden');
  }

  // Add user message to UI
  addMessageToUI('user', message);

  // Clear input
  userInput.value = '';
  userInput.style.height = 'auto';

  // Add to conversation history
  conversationHistory.push({
    role: 'user',
    content: message
  });

  // Show typing indicator
  const typingIndicator = showTypingIndicator();

  // Send to API
  isLoading = true;
  sendBtn.disabled = true;

  try {
    const response = await callClaudeAPI(message);

    // Remove typing indicator
    typingIndicator.remove();

    // Add assistant response to UI
    addMessageToUI('assistant', response);

    // Add to conversation history
    conversationHistory.push({
      role: 'assistant',
      content: response
    });

  } catch (error) {
    // Remove typing indicator
    typingIndicator.remove();

    // Show error
    addErrorToUI(error.message || 'Failed to get response. Please try again.');

    // Remove the user message from history since we failed
    conversationHistory.pop();
  } finally {
    isLoading = false;
    sendBtn.disabled = false;
    userInput.focus();
  }
}

async function callClaudeAPI(userMessage) {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: conversationHistory
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    if (response.status === 401) {
      throw new Error('Invalid API key. Please check your settings.');
    } else if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    } else if (response.status === 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }
  }

  const data = await response.json();

  if (data.content && data.content.length > 0) {
    return data.content[0].text;
  }

  throw new Error('Unexpected response format');
}

// UI Updates
function addMessageToUI(role, content) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${role}`;

  const avatarDiv = document.createElement('div');
  avatarDiv.className = 'message-avatar';
  avatarDiv.textContent = role === 'user' ? 'U' : 'AI';

  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  contentDiv.innerHTML = formatMessage(content);

  messageDiv.appendChild(avatarDiv);
  messageDiv.appendChild(contentDiv);

  messagesContainer.appendChild(messageDiv);
  scrollToBottom();
}

function addErrorToUI(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;

  messagesContainer.appendChild(errorDiv);
  scrollToBottom();
}

function showTypingIndicator() {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message assistant';

  const avatarDiv = document.createElement('div');
  avatarDiv.className = 'message-avatar';
  avatarDiv.textContent = 'AI';

  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';

  const typingDiv = document.createElement('div');
  typingDiv.className = 'typing-indicator';
  typingDiv.innerHTML = '<span></span><span></span><span></span>';

  contentDiv.appendChild(typingDiv);
  messageDiv.appendChild(avatarDiv);
  messageDiv.appendChild(contentDiv);

  messagesContainer.appendChild(messageDiv);
  scrollToBottom();

  return messageDiv;
}

function showError(message) {
  // Simple alert for now, could be enhanced with a toast notification
  alert(message);
}

function scrollToBottom() {
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Message Formatting
function formatMessage(content) {
  // Escape HTML first
  let formatted = escapeHtml(content);

  // Format code blocks (```code```)
  formatted = formatted.replace(/```(\w*)\n?([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code class="language-${lang}">${code.trim()}</code></pre>`;
  });

  // Format inline code (`code`)
  formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Format bold (**text**)
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Format italic (*text*)
  formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Format bullet lists
  formatted = formatted.replace(/^[\s]*[-•]\s+(.+)$/gm, '<li>$1</li>');
  formatted = formatted.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Format numbered lists
  formatted = formatted.replace(/^[\s]*\d+\.\s+(.+)$/gm, '<li>$1</li>');

  // Format line breaks
  formatted = formatted.replace(/\n\n/g, '</p><p>');
  formatted = formatted.replace(/\n/g, '<br>');

  // Wrap in paragraph
  formatted = `<p>${formatted}</p>`;

  // Clean up empty paragraphs
  formatted = formatted.replace(/<p>\s*<\/p>/g, '');

  return formatted;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
