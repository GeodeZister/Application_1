// Drawing.js
export class Drawing {
    constructor(canvasId, boundingBoxParams) {
        this.canvas = document.getElementById(canvasId);
        if (this.canvas) {
            paper.setup(this.canvas);
            this.startPoint = null;
            this.boundingBoxParams = boundingBoxParams;
            this.tempLine = null;
            this.vertexMarkers = [];
            this.selectedMarker = null;
            this.hoveredMarker = null;
            this.currentLine = null;
            this.lines = [];
            this.walls = [];
            this.isActive = false;
            this.isDeleteActive = false;
            this.isWallActive = false;

            // Default line style
            this.lineColor = 'black';
            this.lineWidth = 2;

            this.setupListeners();
        } else {
            console.error(`Canvas with id '${canvasId}' not found.`);
        }
    }

    setupListeners() {
        this.canvas.addEventListener('mousedown', (event) => this.handleMouseDown(event));
        this.canvas.addEventListener('mousemove', (event) => this.handleMouseMove(event));
        this.canvas.addEventListener('mouseup', (event) => this.handleMouseUp(event));
        this.canvas.addEventListener('mouseout', () => this.handleMouseOut());
    }

    setLineColor(color) {
        this.lineColor = color;
    }

    setLineWidth(width) {
        this.lineWidth = width;
    }

    getMousePosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        return new paper.Point(
            event.clientX - rect.left,
            event.clientY - rect.top
        );
    }

    handleMouseDown(event) {
        const point = this.getMousePosition(event);

        if (this.isDeleteActive && event.button === 0) { // Left button for deletion
            const marker = this.findVertexMarker(point);
            if (marker) {
                this.removeVertexMarker(marker);
                paper.view.update();
            }
            event.preventDefault();
        } else if (this.isActive && event.button === 2) { // Right button for dragging
            this.selectedMarker = this.findVertexMarker(point);
        } else if (this.isActive && event.button === 0) { // Left button for drawing
            const vertexMarker = this.findVertexMarker(point);
            if (vertexMarker) {
                this.currentLine = vertexMarker.line;
                this.startPoint = vertexMarker.position;
                this.createTempLine(this.startPoint);
            } else {
                this.startDrawing(point);
            }
        } else if (this.isWallActive && event.button === 0) { // Left button for drawing walls
            this.startWall(point);
        } else if (this.isWallActive && event.button === 2) { // Right button to delete the last wall
            this.deleteLastWall();
            event.preventDefault();
        }
    }

    handleMouseMove(event) {
        const point = this.getMousePosition(event);

        if (this.selectedMarker) {
            this.dragVertexMarker(point);
            return;
        }

        this.handleHover(point);

        if (this.startPoint) {
            this.updateTempLine(point);
        }
    }

    handleMouseUp(event) {
        const endPoint = this.getMousePosition(event);

        if (this.selectedMarker) {
            this.finalizeVertexDrag();
        } else if (this.startPoint) {
            if (this.isWallActive) {
                this.finishWallDrawing(endPoint);
            } else {
                this.finishDrawing(endPoint);
            }
        }
    }

    handleMouseOut() {
        this.resetDrawingState();
    }

    startDrawing(point) {
        this.currentLine = new paper.Path.Line(point, point);
        this.currentLine.strokeColor = this.lineColor;
        this.currentLine.strokeWidth = this.lineWidth;
        this.lines.push(this.currentLine);
        this.addVertexMarker(point, this.currentLine, 0);
        this.startPoint = point;
        this.createTempLine(this.startPoint);
    }

    createTempLine(startPoint) {
        if (this.tempLine) {
            this.tempLine.remove();
        }
        this.tempLine = new paper.Path.Line({
            from: startPoint,
            to: startPoint,
            strokeColor: this.lineColor, // Updated to use the selected line color
            strokeWidth: this.lineWidth
        });
        paper.view.update();
    }

    updateTempLine(endPoint) {
        if (this.tempLine) {
            this.tempLine.segments[1].point = endPoint;
            paper.view.update();
        }
    }

    finishDrawing(endPoint) {
        if (this.currentLine) {
            this.currentLine.add(endPoint);
            this.addVertexMarker(endPoint, this.currentLine, this.currentLine.segments.length - 1);
        } else {
            const finalLine = new paper.Path.Line(this.startPoint, endPoint);
            finalLine.strokeColor = this.lineColor;
            finalLine.strokeWidth = this.lineWidth;
            this.lines.push(finalLine);
            this.addVertexMarker(this.startPoint, finalLine, 0);
            this.addVertexMarker(endPoint, finalLine, 1);
        }

        if (this.tempLine) {
            this.tempLine.remove();
            this.tempLine = null;
        }
        this.startPoint = null;
        paper.view.update();
    }

    resetDrawingState() {
        if (this.tempLine) {
            this.tempLine.remove();
            this.tempLine = null;
        }

        this.startPoint = null;
        this.selectedMarker = null;

        if (this.hoveredMarker) {
            this.hoveredMarker.fillColor = 'black';
            this.hoveredMarker = null;
        }

        paper.view.update();
    }

    dragVertexMarker(point) {
        this.selectedMarker.position = point;
        this.updateLineWithVertex(this.selectedMarker);
        paper.view.update();
    }

    finalizeVertexDrag() {
        this.updateLineWithVertex(this.selectedMarker);
        this.selectedMarker = null;
        paper.view.update();
    }

    handleHover(point) {
        const hoveredMarker = this.findVertexMarker(point);
        if (hoveredMarker) {
            if (this.hoveredMarker !== hoveredMarker) {
                if (this.hoveredMarker) {
                    this.hoveredMarker.fillColor = 'black';
                }
                hoveredMarker.fillColor = 'yellow';
                this.hoveredMarker = hoveredMarker;
            }
        } else if (this.hoveredMarker) {
            this.hoveredMarker.fillColor = 'black';
            this.hoveredMarker = null;
        }
    }

    addVertexMarker(point, line, index) {
        const marker = new paper.Path.Circle(point, 5);
        marker.strokeColor = 'black';
        marker.fillColor = 'black';
        marker.line = line;
        marker.segmentIndex = index;

        this.vertexMarkers.push(marker);
        paper.view.update();
    }

    findVertexMarker(point) {
        return this.vertexMarkers.find(marker => marker.contains(point));
    }

    removeVertexMarker(marker) {
        marker.remove();
        const segmentIndex = marker.segmentIndex;
        const line = marker.line;

        if (line.segments.length > 2) {
            line.removeSegment(segmentIndex);
            this.vertexMarkers.forEach((m) => {
                if (m.line === line && m.segmentIndex > segmentIndex) {
                    m.segmentIndex -= 1;
                }
            });
        } else {
            line.remove();
            this.vertexMarkers = this.vertexMarkers.filter(m => m.line !== line);
            this.lines = this.lines.filter(l => l !== line);
        }
        paper.view.update();
    }

    updateLineWithVertex(marker) {
        const segment = marker.line.segments[marker.segmentIndex];
        segment.point = marker.position;
    }

    addWall(startPoint, endPoint) {
        const wall = new paper.Path.Line(startPoint, endPoint);
        wall.strokeColor = this.lineColor;
        wall.strokeWidth = this.lineWidth;
        this.walls.push(wall);
        paper.view.update();
    }

    importWalls(wallsData) {
        wallsData.forEach(wall => {
            this.addWall(new paper.Point(wall.start.x, wall.start.y), new paper.Point(wall.end.x, wall.end.y));
        });
    }

    exportWalls() {
        return this.walls.map(wall => ({
            start: { x: wall.segments[0].point.x, y: wall.segments[0].point.y },
            end: { x: wall.segments[1].point.x, y: wall.segments[1].point.y }
        }));
    }

    activate() {
        this.isActive = true;
        this.isDeleteActive = false;
        this.isWallActive = false;
        console.log('Drawing tool activated');
    }

    deactivate() {
        this.isActive = false;
        console.log('Drawing tool deactivated');
    }

    activateDelete() {
        this.isDeleteActive = true;
        this.isActive = false;
        this.isWallActive = false;
        console.log('Delete tool activated');
    }

    deactivateDelete() {
        this.isDeleteActive = false;
        console.log('Delete tool deactivated');
    }

    activateWall() {
        this.isWallActive = true;
        this.isActive = false;
        this.isDeleteActive = false;
        console.log('Wall drawing tool activated');
    }

    deactivateWall() {
        this.isWallActive = false;
        console.log('Wall drawing tool deactivated');
    }

    startWall(point) {
        this.currentLine = new paper.Path.Line(point, point);
        this.currentLine.strokeColor = this.lineColor;
        this.currentLine.strokeWidth = this.lineWidth;
        this.walls.push(this.currentLine);
        this.startPoint = point;
        this.createTempLine(this.startPoint);
    }

    finishWallDrawing(endPoint) {
        if (this.currentLine) {
            this.currentLine.add(endPoint);
            if (this.tempLine) {
                this.tempLine.remove();
                this.tempLine = null;
            }
            this.startPoint = null;
            paper.view.update();
        }
    }

    deleteLastWall() {
        if (this.walls.length > 0) {
            const lastWall = this.walls.pop();
            lastWall.remove();
            paper.view.update();
        }
    }
}
