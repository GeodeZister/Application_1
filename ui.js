// ui.js
import { Grid } from './grid.js';
import { Drawing } from './drawing.js';

export class UI {
    constructor(canvasId, rasterImageUrl) {
        this.canvas = document.getElementById(canvasId);
        paper.setup(this.canvas);

        this.gridLayer = new paper.Layer();
        this.drawingLayer = new paper.Layer();
        this.scale = parseInt(document.getElementById('scaleInput').value, 10);
        this.origin = new paper.Point(0, 0);
        this.grid = new Grid(this.gridLayer, this.drawingLayer, this.scale, this.origin);
        this.drawing = new Drawing(this.drawingLayer, this.grid, rasterImageUrl);

        this.initializeControls();
        this.drawing.initializeTool();
    }

    initializeControls() {
    document.getElementById('toggleSnap').addEventListener('click', () => {
        this.drawing.toggleSnapToEdge();
        this.updateSnapButton();
    });

    document.getElementById('addRasterImage').addEventListener('click', function() {
       document.getElementById('rasterImageModal').style.display = 'block';
       // Ініціалізація логіки для завантаження та попереднього перегляду зображення
    });

    document.getElementById('closeModal').addEventListener('click', function() {
        document.getElementById('rasterImageModal').style.display = 'none';
    });


    document.getElementById('toggleBackground').addEventListener('click', () => {
        this.drawing.toggleRasterVisibility();
    }); // This line was missing.
    document.getElementById('undo').addEventListener('click', () => this.drawing.undoLastPath());

    document.getElementById('toggleGrid').addEventListener('click', () => {
        this.grid.toggleGrid();
    });

    document.getElementById('lineWidth').addEventListener('change', (event) => {
        this.drawing.setStrokeWidth(parseInt(event.target.value, 10));
    });

    document.getElementById('lineColor').addEventListener('change', (event) => {
        this.drawing.setStrokeColor(event.target.value);
    });

    document.getElementById('lineStyle').addEventListener('change', (event) => {
        this.drawing.setLineStyle(event.target.value);
    });

    document.getElementById('scaleInput').addEventListener('change', (event) => {
        this.grid.updateScale(parseInt(event.target.value, 10));
    });

    document.getElementById('exportSVG').addEventListener('click', () => this.exportSVG());
}

    updateSnapButton() {
        const snapButton = document.getElementById('toggleSnap');
        snapButton.textContent = this.drawing.snapToEdge ? "Snap-to-Edge ON" : "Snap-to-Edge OFF";
    }

    exportSVG() {
        const svg = paper.project.exportSVG({ asString: true });
        const blob = new Blob([svg], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'drawing.svg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}
