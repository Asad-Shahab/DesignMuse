import addOnUISdk from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

let GEMINI_API_KEY = deobfuscateKey(localStorage.getItem('geminiApiKey'));
let genAI = null;

// DOM Elements
const apiKeySection = document.getElementById('apiKeySection');
const mainAppSection = document.getElementById('mainAppSection');
const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiKeyButton = document.getElementById('saveApiKey');
const captureWorkspaceButton = document.getElementById("captureWorkspace");
const captureBlock = document.getElementById("captureBlock");
const captureText = document.getElementById("captureText");
const confirmCaptureButton = document.getElementById("confirmCapture");
const captureDisplay = document.getElementById("captureDisplay");

// Add these utility functions after the variable declarations
function obfuscateKey(key) {
    return "dm_" + btoa(key);
}

function deobfuscateKey(obfuscatedKey) {
    if (obfuscatedKey && obfuscatedKey.startsWith("dm_")) {
        try {
            return atob(obfuscatedKey.substring(3));
        } catch (e) {
            console.error("Error deobfuscating key:", e);
            return null;
        }
    }
    return obfuscatedKey;
}

// Function to handle API key saving
async function handleApiKeySave() {
    const apiKey = apiKeyInput.value.trim();
    const saveText = document.getElementById("saveApiKeyText");
    const saveSpinner = document.getElementById("saveApiKeySpinner");
    const apiKeyError = document.getElementById("apiKeyError");
    
    apiKeyError.style.display = "none";
    
    if (!apiKey) {
        apiKeyError.textContent = "Please enter an API key";
        apiKeyError.style.display = "block";
        return;
    }
    
    try {
        saveApiKeyButton.disabled = true;
        saveText.textContent = "Validating...";
        saveSpinner.style.display = "inline-block";
        
        const validationResult = await validateApiKey(apiKey);
        
        if (validationResult.valid) {
            localStorage.setItem('geminiApiKey', obfuscateKey(apiKey));
            GEMINI_API_KEY = apiKey;
            await initializeGemini();
            toggleAppView('main');
        } else {
            apiKeyError.textContent = validationResult.message;
            apiKeyError.style.display = "block";
        }
    } catch (error) {
        console.error("Error during API key validation:", error);
        apiKeyError.textContent = "An unexpected error occurred. Please try again.";
        apiKeyError.style.display = "block";
    } finally {
        saveApiKeyButton.disabled = false;
        saveText.textContent = "Save API Key";
        saveSpinner.style.display = "none";
    }
}

// Function to ensure SDK is loaded
async function ensureSDKLoaded(timeout = 5000) {
    const startTime = Date.now();
    
    while (!window.GoogleGenerativeAI) {
        if (Date.now() - startTime > timeout) {
            throw new Error("Timeout waiting for SDK to load");
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

// Initialize Gemini
async function initializeGemini() {
    try {
        await ensureSDKLoaded();
        
        const storedKey = localStorage.getItem('geminiApiKey');
        const decodedKey = deobfuscateKey(storedKey);
        
        if (!decodedKey) {
            throw new Error("No valid API key found");
        }
        
        GEMINI_API_KEY = decodedKey;
        genAI = new window.GoogleGenerativeAI(GEMINI_API_KEY);
        console.log("Gemini initialized successfully");
        return genAI;
    } catch (error) {
        console.error("Error initializing Gemini:", error);
        toggleAppView('apiKey');
        localStorage.removeItem('geminiApiKey');
        throw error;
    }
}

// Format AI response for better readability
function formatAIResponse(response) {
    const sections = response.split(/(?=•)/);
    
    return sections.map(section => {
        // Replace multiple line breaks with a single smaller break
        const formattedSection = section.trim()
            .replace(/\n+/g, '<br>') // Replace any number of line breaks with a single <br>
            .replace(/•/g, '<br>•'); // Add small break before bullet points except the first one
        if (section.trim().startsWith('•')) {
            return `<div class="analysis-section">
                <p class="analysis-content">${formattedSection}</p>
            </div>`;
        }
        return `<div class="analysis-section">
            <p class="analysis-content">${formattedSection}</p>
        </div>`;
    }).join('');
}

// Image conversion helper function
async function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// Gemini analysis function
async function analyzeWithGemini(imageBase64, userPrompt) {
    try {
        console.log("Starting Gemini analysis process");
        
        if (!genAI) {
            console.log("Initializing Gemini...");
            await initializeGemini();
        }
        
        console.log("Creating model instance...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const systemPrompt = `Analyze the attached image of the current design workspace and address the user's specific question: ${userPrompt}.

If the user's question is specific (e.g., colors, typography, layout), provide a direct response focusing only on that aspect.

If the input is general or unclear, choose the two most relevant areas from this list:

Layout – A key suggestion to improve structure and alignment.

Color – The most impactful adjustment for color harmony or contrast.

Typography – The main change for better text readability or visual impact.

Balance – An essential tweak to enhance visual flow and balance.

Each suggestion should be kept to 1-2 sentences.

Use at least one line break after each sentence.

Separate points with a double line break to enhance readability

Add two line breaks between distinct suggestions to improve readability.

Avoid any special formatting like asterisks or bold text in your response.

Do not state which aspects were chosen. Simply provide advice naturally.

Keep your feedback specific, actionable, and concise.`;

        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: "image/jpeg"
            }
        };
        
        console.log("Sending request to Gemini API");
        const result = await model.generateContent([systemPrompt, imagePart]);
        console.log("Received response from Gemini API");
        const response = await result.response;
        
        return response.text();
    } catch (error) {
        console.error('Detailed Gemini Analysis Error:', error);
        throw new Error('Failed to analyze with Gemini: ' + error.message);
    }
}

// Add these new functions before initializeGemini
async function validateApiKey(apiKey) {
    try {
        await ensureSDKLoaded();
        const tempGenAI = new window.GoogleGenerativeAI(apiKey);
        const model = tempGenAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        
        const result = await model.generateContent("Test connection. Reply with 'OK' only.");
        await result.response;
        
        return { valid: true };
    } catch (error) {
        console.error("API key validation error:", error);
        
        let errorMessage = "Invalid API key. Please check and try again.";
        
        if (error.message?.toLowerCase().includes("rate limit")) {
            errorMessage = "API rate limit exceeded. Please try again later.";
        } else if (error.message?.toLowerCase().includes("permission")) {
            errorMessage = "You don't have permission to access this model with this API key.";
        } else if (error.message?.toLowerCase().includes("network")) {
            errorMessage = "Network error. Please check your connection and try again.";
        }
        
        return { valid: false, message: errorMessage };
    }
}

function toggleAppView(view) {
    if (view === 'main') {
        apiKeySection.style.display = 'none';
        mainAppSection.style.display = 'block';
    } else if (view === 'apiKey') {
        apiKeySection.style.display = 'block';
        mainAppSection.style.display = 'none';
        
        const backButton = document.getElementById("backToApp");
        backButton.style.display = GEMINI_API_KEY ? "block" : "none";
    }
}

// Initialize the add-on
addOnUISdk.ready.then(async () => {
    console.log("AddOnUISdk is ready");
    
    const settingsButton = document.getElementById("settingsButton");
    const backToAppButton = document.getElementById("backToApp");
    
    settingsButton.addEventListener("click", () => {
        toggleAppView('apiKey');
    });
    
    backToAppButton.addEventListener("click", () => {
        toggleAppView('main');
    });
    
    // Check if API key exists
    if (!GEMINI_API_KEY) {
        apiKeySection.style.display = 'block';
        mainAppSection.style.display = 'none';
        
        // Add event listener for API key save button
        saveApiKeyButton.addEventListener('click', handleApiKeySave);
        
        // Add enter key support for API key input
        apiKeyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleApiKeySave();
            }
        });
    } else {
        apiKeySection.style.display = 'none';
        mainAppSection.style.display = 'block';
        
        // Try to initialize Gemini
        try {
            await initializeGemini();
        } catch (error) {
            console.error("Initial Gemini initialization failed:", error);
        }
    }
    
    try {
        const { runtime } = addOnUISdk.instance;
        const sandboxProxy = await runtime.apiProxy("documentSandbox");
        
        // Capture Workspace Button Handler
        captureWorkspaceButton.addEventListener("click", () => {
            console.log("Opening capture interface...");
            captureBlock.style.display = "block";
            captureText.innerHTML = '';
            captureText.focus();
        });
        
        // Save Button Handler
        confirmCaptureButton.addEventListener("click", async () => {
            const text = captureText.innerText.trim();
            
            if (!text || text === captureText.getAttribute('data-placeholder')) {
                alert("Please enter your feedback request.");
                return;
            }
            
            try {
                confirmCaptureButton.disabled = true;
                confirmCaptureButton.textContent = 'Analyzing...';
                
                const response = await addOnUISdk.app.document.createRenditions({
                    range: "currentPage",
                    format: "image/jpeg",
                });
                
                captureDisplay.innerHTML = `
                    <div class="feedback-container">
                        <div class="feedback-box">
                            <div class="feedback-label">Your Question:</div>
                            <div class="feedback-text">${text}</div>
                        </div>
                        <div class="feedback-box">
                            <div class="feedback-label">Design Feedback</div>
                            <div class="feedback-text analyzing">
                                <div class="loading-spinner"></div>
                                Analyzing your design...
                            </div>
                        </div>
                    </div>
                `;
                
                const base64Image = await blobToBase64(response[0].blob);
                const analysis = await analyzeWithGemini(base64Image, text);
                
                const aiResponseBox = captureDisplay.querySelector('.analyzing');
                aiResponseBox.innerHTML = formatAIResponse(analysis);
                aiResponseBox.classList.remove('analyzing');
                
            } catch (error) {
                console.error("Error:", error);
                captureDisplay.innerHTML = `
                    <div class="feedback-container">
                        <div class="error-message">
                            <h3>Analysis Error</h3>
                            <p>${error.message}</p>
                            <button onclick="location.reload()">Try Again</button>
                        </div>
                    </div>
                `;
            } finally {
                captureBlock.style.display = "none";
                captureText.innerHTML = '';
                confirmCaptureButton.disabled = false;
                confirmCaptureButton.textContent = 'Get Design Feedback';
            }
        });
        
        console.log("Add-on initialization complete");
        
    } catch (error) {
        console.error("Error initializing add-on:", error);
        alert("Failed to initialize the add-on. Please refresh the page.");
    }
});