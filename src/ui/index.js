import addOnUISdk from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

addOnUISdk.ready.then(async () => {
    console.log("addOnUISdk is ready for use.");
    
    // Get the UI runtime
    const { runtime } = addOnUISdk.instance;
    
    // Get the proxy object
    const sandboxProxy = await runtime.apiProxy("documentSandbox");
    
    // Create Rectangle functionality
    const createRectangleButton = document.getElementById("createRectangle");
    createRectangleButton.addEventListener("click", async event => {
        await sandboxProxy.createRectangle();
    });
    
    // Capture Workspace functionality
    const captureWorkspaceButton = document.getElementById("captureWorkspace");
    const captureBlock = document.getElementById("captureBlock");
    const captureText = document.getElementById("captureText");
    const confirmCaptureButton = document.getElementById("confirmCapture");
    const captureDisplay = document.getElementById("captureDisplay");
    
    captureWorkspaceButton.addEventListener("click", async event => {
        captureBlock.style.display = "block";
        captureText.innerHTML = ''; // Clear any existing content
        captureText.focus();
    });
    
    confirmCaptureButton.addEventListener("click", async event => {
        const text = captureText.innerText.trim();
        
        // Don't allow submission of the placeholder text or empty text
        if (!text || text === captureText.getAttribute('data-placeholder')) {
            alert("Please enter your feedback request.");
            return;
        }
        
        // Show loading state
        confirmCaptureButton.disabled = true;
        confirmCaptureButton.textContent = 'Saving...';

        try {
            // Capture the workspace image (storing for later use)
            const response = await addOnUISdk.app.document.createRenditions({
                range: "currentPage",
                format: "image/jpeg",
            });
            
            // Store the blob URL for later use
            const downloadUrl = URL.createObjectURL(response[0].blob);
            
            // Display the two text boxes
            captureDisplay.innerHTML = `
                <div class="feedback-container">
                    <div class="feedback-box">
                        <div class="feedback-label">Your Feedback Request:</div>
                        <div class="feedback-text">${text}</div>
                    </div>
                    <div class="feedback-box">
                        <div class="feedback-label">AI Response:</div>
                        <div class="feedback-text placeholder">AI response will appear here...</div>
                    </div>
                </div>
            `;
            
            // Store the image URL as a data attribute for later use
            captureDisplay.dataset.imageUrl = downloadUrl;
            
        } catch (error) {
            console.error('Error capturing workspace:', error);
            alert('There was an error capturing the workspace. Please try again.');
        } finally {
            // Reset the capture interface
            captureBlock.style.display = "none";
            captureText.innerHTML = '';
            confirmCaptureButton.disabled = false;
            confirmCaptureButton.textContent = 'Save';
        }
    });
    
    // Enable the create rectangle button
    createRectangleButton.disabled = false;
});