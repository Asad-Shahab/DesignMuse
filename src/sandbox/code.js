// File: src/sandbox/code.js

import addOnSandboxSdk from "add-on-sdk-document-sandbox";
import { editor } from "express-document-sdk";

// Get the document sandbox runtime
const { runtime } = addOnSandboxSdk.instance;

function start() {
    // APIs to be exposed to the UI runtime
    const sandboxApi = {
        createRectangle: async () => {
            try {
                console.log("Creating rectangle in sandbox...");
                const rectangle = editor.createRectangle();

                // Define rectangle dimensions
                rectangle.width = 240;
                rectangle.height = 180;

                // Define rectangle position
                rectangle.translation = { x: 10, y: 10 };

                // Define rectangle color
                const color = { red: 0.32, green: 0.34, blue: 0.89, alpha: 1 };

                // Fill the rectangle with the color
                const rectangleFill = editor.makeColorFill(color);
                rectangle.fill = rectangleFill;

                // Add the rectangle to the document
                const insertionParent = editor.context.insertionParent;
                insertionParent.children.append(rectangle);
                
                console.log("Rectangle created successfully");
                return true;
            } catch (error) {
                console.error("Error in createRectangle:", error);
                throw error;
            }
        }
    };

    // Expose sandboxApi to the UI runtime
    runtime.exposeApi(sandboxApi);
    console.log("Sandbox API exposed successfully");
}

start();