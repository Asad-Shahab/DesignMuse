import addOnUISdk from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

const GEMINI_API_KEY = 'AIzaSyD-4AXRjiQ3MtYHqpLG7q51b3QkKwBUAd0';
let genAI = null;

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
        genAI = new window.GoogleGenerativeAI(GEMINI_API_KEY);
        console.log("Gemini initialized successfully");
        return genAI;
    } catch (error) {
        console.error("Error initializing Gemini:", error);
        throw error;
    }
}

// Format AI response for better readability
function formatAIResponse(response) {
    const sections = response.split(/(?=\d\. )/);
    
    return sections.map(section => {
        if (/^\d\. /.test(section)) {
            return `<div class="analysis-section">
                <h3 class="analysis-title">${section.split('\n')[0]}</h3>
                <p class="analysis-content">${section.split('\n').slice(1).join('\n')}</p>
            </div>`;
        }
        return `<div class="analysis-section">
            <p class="analysis-content">${section}</p>
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

        const systemPrompt = `Analyze the attached image of the current design workspace, and respond to the user's specific question: ${userPrompt}. 
        Additionally, provide focused, concise feedback on:
        1. Layout – suggest improvements for better structure and alignment.
        2. Color scheme – recommend adjustments for harmony and contrast.
        3. Typography – assess readability and visual impact.
        4. Overall visual balance – propose changes for better flow and proportion.
        Prioritize three high-impact changes for the design's visual quality and coherence.`;
        
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

// Initialize the add-on
addOnUISdk.ready.then(async () => {
    console.log("AddOnUISdk is ready");
    
    // Try to initialize Gemini
    try {
        await initializeGemini();
    } catch (error) {
        console.error("Initial Gemini initialization failed:", error);
    }

    const createRectangleButton = document.getElementById("createRectangle");
    const captureWorkspaceButton = document.getElementById("captureWorkspace");
    const captureBlock = document.getElementById("captureBlock");
    const captureText = document.getElementById("captureText");
    const confirmCaptureButton = document.getElementById("confirmCapture");
    const captureDisplay = document.getElementById("captureDisplay");

    try {
        const { runtime } = addOnUISdk.instance;
        const sandboxProxy = await runtime.apiProxy("documentSandbox");

        // Create Rectangle Button Handler
        createRectangleButton.addEventListener("click", async () => {
            try {
                console.log("Creating rectangle...");
                await sandboxProxy.createRectangle();
            } catch (error) {
                console.error("Error creating rectangle:", error);
                alert("Failed to create rectangle. Please try again.");
            }
        });

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
                            <div class="feedback-label">Design Analysis</div>
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
                confirmCaptureButton.textContent = 'Save';
            }
        });

        createRectangleButton.disabled = false;
        console.log("Add-on initialization complete");

    } catch (error) {
        console.error("Error initializing add-on:", error);
        alert("Failed to initialize the add-on. Please refresh the page.");
    }
});