# Salesforce Assistant - Chrome Extension

A Chrome Extension that provides an AI-powered chatbot to help you learn and use Salesforce effectively. Powered by Claude AI from Anthropic.

## Features

- **Salesforce Expertise**: Get instant answers about Sales Cloud, Service Cloud, Marketing Cloud, and more
- **Code Examples**: Receive Apex, SOQL, and Lightning Web Component code snippets
- **Best Practices**: Learn Salesforce development best practices and avoid common pitfalls
- **Conversation History**: Maintains context throughout your conversation session
- **Clean UI**: Modern, intuitive chat interface with Salesforce-inspired design

## Topics Covered

The assistant can help with:

- Salesforce Administration (users, security, data management)
- Sales Cloud (leads, opportunities, accounts, contacts)
- Service Cloud (cases, knowledge base, omni-channel)
- Marketing Cloud (email studio, journey builder)
- Apex Development (triggers, classes, batch processing)
- Lightning Web Components (LWC)
- SOQL and SOSL queries
- Salesforce APIs (REST, SOAP, Bulk)
- Workflows, Process Builder, and Flows
- Deployment and change management
- Salesforce DX and CLI tools

## Installation

### Prerequisites

- Google Chrome browser
- An Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com/))

### Steps

1. **Download the Extension**
   - Clone or download this repository to your local machine

2. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" using the toggle in the top-right corner
   - Click "Load unpacked"
   - Select the folder containing the extension files

3. **Configure API Key**
   - Click on the extension icon in Chrome's toolbar
   - Click the settings (gear) icon in the top-right of the popup
   - Enter your Anthropic API key
   - Click "Save"

4. **Start Chatting**
   - Click the extension icon to open the chatbot
   - Type your Salesforce-related question and press Enter

## Usage

### Basic Usage

1. Click the extension icon in your Chrome toolbar
2. Type a question about Salesforce in the input field
3. Press Enter or click the send button
4. Wait for the AI to respond with helpful information

### Example Questions

- "How do I create a trigger that prevents duplicate contacts?"
- "What's the difference between Process Builder and Flow?"
- "Write a SOQL query to get all opportunities closing this month"
- "How do I set up a validation rule for phone number format?"
- "Explain Lightning Web Components lifecycle hooks"
- "What are Salesforce governor limits for DML operations?"

### Context Menu

You can also select text on any webpage, right-click, and choose "Ask Salesforce Assistant about [selected text]" to quickly ask about specific terms or concepts.

## File Structure

```
salesforce-assistant/
├── manifest.json      # Chrome extension configuration
├── popup.html         # Main chat interface HTML
├── popup.css          # Styling for the chat interface
├── popup.js           # Chat logic and API integration
├── background.js      # Service worker for background tasks
├── icons/             # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md          # This file
```

## Privacy & Security

- Your API key is stored locally in Chrome's storage and is never sent anywhere except to Anthropic's API
- Conversations are processed through Anthropic's Claude API
- No data is collected or stored on external servers
- All communication with the API uses HTTPS

## Troubleshooting

### "Invalid API key" error
- Verify your API key is correct in the settings
- Ensure your API key has not expired
- Check that you have sufficient API credits

### "Rate limit exceeded" error
- Wait a few moments before sending another message
- Consider upgrading your Anthropic API plan for higher limits

### Extension not loading
- Make sure all files are present in the extension folder
- Check the Chrome console for any errors (`chrome://extensions/` → Details → "Inspect views")
- Try reloading the extension

## Development

### Making Changes

1. Edit the source files as needed
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

### API Configuration

The extension uses:
- **Model**: Claude Sonnet (claude-sonnet-4-20250514)
- **Max Tokens**: 2048
- **API Version**: 2023-06-01

To modify these settings, edit the constants at the top of `popup.js`.

## License

This project is provided as-is for educational and personal use.

## Support

For issues with:
- **This extension**: Create an issue in this repository
- **Anthropic API**: Visit [Anthropic's documentation](https://docs.anthropic.com/)
- **Salesforce questions**: Use the chatbot itself!

---

Made with Claude AI
