// app.js
import { UI } from './ui.js';
import { RasterScaleModule } from './rasterScaleModule.js';



document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI('drawingCanvas');

    document.getElementById('addRasterImage').addEventListener('click', function() {
        document.getElementById('rasterImageModal').style.display = 'block';
    });

    document.getElementById('selectRasterImage').addEventListener('click', function() {
        const imgSrc = 'https://i.ibb.co/T4pjHw7/photo-2024-02-12-09-47-30.jpg'; // The base image URL
        const rasterImageElement = document.getElementById('rasterPreview');
        rasterImageElement.onload = function() {
            const markerCanvasElement = document.getElementById('markerCanvas');
            markerCanvasElement.width = rasterImageElement.offsetWidth;
            markerCanvasElement.height = rasterImageElement.offsetHeight;
            markerCanvasElement.style.display = 'block'; // Make sure the canvas is visible
            new RasterScaleModule(rasterImageElement, markerCanvasElement);
        }
        rasterImageElement.src = imgSrc;
        rasterImageElement.style.display = 'block'; // Show the image

        // Prepare the canvas for drawing markers
        const markerCanvasElement = document.getElementById('markerCanvas');
        markerCanvasElement.width = rasterImageElement.offsetWidth;
        markerCanvasElement.height = rasterImageElement.offsetHeight;
        markerCanvasElement.style.display = 'block'; // Make sure the canvas is visible

        // Ensure the canvas is properly positioned over the image
        const rasterImageContainer = document.getElementById('rasterImageContainer');
        if (rasterImageContainer) {
            markerCanvasElement.style.left = rasterImageElement.offsetLeft + 'px';
            markerCanvasElement.style.top = rasterImageElement.offsetTop + 'px';
        }

        // Instantiate the RasterScaleModule with the image and canvas
        new RasterScaleModule(rasterImageElement, markerCanvasElement);
    });

    document.getElementById('closeModal').addEventListener('click', function() {
        document.getElementById('rasterImageModal').style.display = 'none';
    });

    // Initialize UI color picker display and interaction
    const colorInput = document.getElementById('lineColor');
    const colorDisplay = document.getElementById('colorDisplay');
    colorDisplay.style.backgroundColor = colorInput.value;

    colorInput.addEventListener('change', () => {
        colorDisplay.style.backgroundColor = colorInput.value;
    });

    colorDisplay.addEventListener('click', () => {
        colorInput.click();
    });

    // Additional UI setup or module initialization can go here
    // For example, initializing RasterScaleModule if needed
});
