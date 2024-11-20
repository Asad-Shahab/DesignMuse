# DesignMuse

## Overview
This Adobe Express add-on helps designers improve work by providing AI-powered design feedback. Users can request specific feedback about their current workspace (e.g., color schemes, typography, layout) and receive targeted suggestions using Google's Gemini Pro AI model.

## Features
 - Secure API key management
 - Workspace state capture
 - Custom feedback prompting system
 - AI-powered design analysis using Gemini Pro
 - Real-time feedback display with loading states
 - Persistent API key storage
 - Error handling and recovery

## Tech Stack
- Adobe Express Add-on SDK
- Google Gemini Pro API
- HTML/CSS/JavaScript

## Setup Instructions

### Prerequisites
1. Adobe Express account
2. Google Cloud Platform account with Gemini API access
    - Create a project in Google Cloud Console
    - Enable the Gemini API
    - Generate an API key (Get Gemini API Key)
3. Node.js installed on your machine

### Installation
```bash
1. Clone the repository
git clone https://github.com/Asad-Shahab/DesignMuse/.git
cd designmuse
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run start
```

4. Load the add-on in Adobe Express
- Open Adobe Express
- Navigate to Add-ons panel
- Select "Load Local Add-on"
- Choose the project directory

## Usage
1. Open your design in Adobe Express
2. Launch the DesignMuse add-on
3. First-time setup:
    - Enter your Gemini API key when prompted
    - The key will be securely stored for future sessions

4. Once configured:
    - Click "Analyze Design"
    - Enter your specific feedback request (e.g., "How can I improve the color contrast?")
    - Click "Get Design Feedback" to receive AI-powered suggestions

## Security Notes
- API keys are stored locally in the browser's localStorage
- Keys are never transmitted except to Google's API
- Users can reset their API key by clearing browser data
- No design data is stored permanently - all analysis is real-time

## Development Notes
- The add-on uses Adobe Express's document sandbox for secure workspace access
- Feedback formatting includes:
    - Natural language processing
    - Proper spacing and line breaks
    - Bullet points for clarity

- Comprehensive error handling for:
    - API failures
    - Invalid API keys
    - Rendering issues
    - Network problems

- Responsive UI with loading states and user feedback
- Modular code structure for easy maintenance

## Troubleshooting
### If the API key is not working:
- Verify the key is valid in Google Cloud Console
- Clear browser data and re-enter the key
- Check console for detailed error messages

### If feedback is not generating:
- Ensure workspace has visible elements
- Check internet connection
- Verify API key permissions
