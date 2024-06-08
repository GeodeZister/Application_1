// grid.js
export class Grid {
    constructor(gridLayer, drawingLayer, scale, origin) {
        this.gridLayer = gridLayer;
        this.drawingLayer = drawingLayer;
        this.scale = scale;
        this.origin = origin;
        this.gridVisible = false;
    }

    drawGrid() {
        this.gridLayer.activate(); // Activate the grid layer
        this.gridLayer.removeChildren(); // Clear the grid layer before drawing a new grid

        if (this.gridVisible) {
            let bounds = paper.view.bounds;
            // Use a semi-transparent stroke color for grid lines
            const strokeColor = 'rgba(224, 224, 224, 0.7)'; // Adjusted for semi-transparency
            for (let x = this.origin.x; x < bounds.width; x += this.scale) {
                new paper.Path.Line({
                    from: [x, bounds.top],
                    to: [x, bounds.bottom],
                    strokeColor: strokeColor
                });
            }
            for (let y = this.origin.y; y < bounds.height; y += this.scale) {
                new paper.Path.Line({
                    from: [bounds.left, y],
                    to: [bounds.right, y],
                    strokeColor: strokeColor
                });
            }
        }

        this.drawingLayer.activate(); // Return to the drawing layer for further actions
    }

    toggleGrid() {
        this.gridVisible = !this.gridVisible;
        this.drawGrid();
    }

    updateScale(newScale) {
        this.scale = newScale;
        this.drawGrid();
    }
}