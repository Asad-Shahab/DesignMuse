# DesignMuse

## Overview
This Adobe Express add-on helps designers improve work by providing AI-powered design feedback. Users can request specific feedback about their current workspace (e.g., color schemes, typography, layout) and receive targeted suggestions using Google's Gemini Pro AI model.

## Features
- Capture the current workspace state
- Custom feedback prompting system
- AI-powered design analysis
- Real-time feedback display

## Tech Stack
- Adobe Express Add-on SDK
- Google Gemini Pro API
- HTML/CSS/JavaScript

## Setup Instructions

### Prerequisites
1. Adobe Express account
2. Google Cloud Platform account with Gemini API access
3. Node.js installed on your machine

### Installation
1. Clone the repository

2. Install dependencies
```bash
npm install
```

3. Configure API Key
- Add your Gemini API key:
```
GEMINI_API_KEY=your-api-key-here
```

4. Start the development server
```bash
npm run start
```

5. Load the add-on in Adobe Express
- Open Adobe Express
- Navigate to Add-ons panel
- Select "Load Local Add-on"
- Choose the project directory

## Usage
1. Open your design in Adobe Express
2. Launch the Design Analysis add-on
3. Click "Analyze Design"
4. Enter your specific feedback request (e.g., "How can I improve the color contrast?")
5. Click "Get Design Feedback" to receive AI-powered suggestions

## Development Notes
- The add-on uses Adobe Express's document sandbox for secure workspace access
- Feedback is formatted for readability with proper spacing and bullet points
- Error handling is implemented for API and rendering failures
- The UI is designed to be responsive and user-friendly
