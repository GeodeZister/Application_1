export class WayPoint {
    constructor(canvasId, scaleParameters) {
        this.canvas = document.getElementById(canvasId);
        this.scaleParameters = scaleParameters;

        if (this.canvas) {
            paper.setup(this.canvas);
            this.wayPoints = [];
            this.isActive = false;
            this.isVisible = true;
            this.isEditMode = false;

            this.boundClickHandler = this.handleClick.bind(this);
            this.boundContextMenuHandler = this.handleContextMenu.bind(this);
        } else {
            console.error(`Canvas with id '${canvasId}' not found.`);
        }
    }

    setupListeners() {
        this.canvas.addEventListener('click', this.boundClickHandler);
        this.canvas.addEventListener('contextmenu', this.boundContextMenuHandler);
    }

    removeListeners() {
        this.canvas.removeEventListener('click', this.boundClickHandler);
        this.canvas.removeEventListener('contextmenu', this.boundContextMenuHandler);
    }

    handleClick(event) {
        if (!this.isActive || event.button !== 0) return;
        const point = new paper.Point(event.offsetX, event.offsetY);
        this.addWayPoint(point);
    }

    handleContextMenu(event) {
        if (!this.isActive) return;
        event.preventDefault();
        this.removeLastWayPoint();
    }

    activateEditMode() {
        this.isEditMode = true;
        this.setupListeners();
        console.log('Way Point edit mode activated');
    }

    deactivateEditMode() {
        this.isEditMode = false;
        this.removeListeners();
        console.log('Way Point edit mode deactivated');
    }

    findWayPointAtPosition(point) {
        return this.wayPoints.find(wp => this.calculateDistance(point, new paper.Point(wp.x, wp.y)) < 6);
    }

    generateWayPointID() {
        const buildingID = this.scaleParameters.getBuildingID().toString().padStart(3, '0');
        const buildingLevel = this.scaleParameters.getBuildingLevel().toString().padStart(2, '0');
        const pointID = (this.wayPoints.length + 1).toString().padStart(3, '0');
        return `${buildingID}${buildingLevel}${pointID}`;
    }

    drawWayPoint(point, id) {
        const wayPointID = id || this.generateWayPointID();
        const existingWayPoint = this.wayPoints.find(wp => wp.id === wayPointID);

        if (existingWayPoint) {
            existingWayPoint.point.position = point;
        } else {
            const outerCircle = new paper.Path.Circle(point, 6);
            outerCircle.strokeColor = 'black';
            outerCircle.fillColor = 'black';

            const innerCircle = new paper.Path.Circle(point, 3);
            innerCircle.strokeColor = 'yellow';
            innerCircle.fillColor = 'yellow';

            const group = new paper.Group([outerCircle, innerCircle]);

            this.wayPoints.push({ id: wayPointID, x: point.x, y: point.y, point: group });
            console.log(`Added way point ID: ${wayPointID}, Coordinates: (${point.x}, ${point.y})`);
        }
        paper.view.update();
    }

    addWayPoint(point, id = null) {
        this.drawWayPoint(point, id);
    }

    removeLastWayPoint() {
        if (this.wayPoints.length > 0) {
            const lastWayPoint = this.wayPoints.pop().point;
            lastWayPoint.remove();
            console.log('Removed last way point');
            paper.view.update();
        }
    }

    getWayPoints() {
        return this.wayPoints;
    }

    calculateDistance(point1, point2) {
        return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
    }

    getLastWayPoint() {
        return this.wayPoints.length > 0 ? this.wayPoints[this.wayPoints.length - 1] : null;
    }

    activate() {
        this.isActive = true;
        this.setupListeners();
        console.log('Way Point tool activated');
    }

    deactivate() {
        this.isActive = false;
        this.removeListeners();
        console.log('Way Point tool deactivated');
    }

    toggleVisibility() {
        this.isVisible = !this.isVisible;
        this.wayPoints.forEach(wp => {
            wp.point.visible = this.isVisible;
        });
        paper.view.update();
    }

    updateWayPoint(id, x, y) {
        const wayPoint = this.wayPoints.find(wp => wp.id === id);
        if (wayPoint) {
            wayPoint.x = x;
            wayPoint.y = y;
            wayPoint.point.position = new paper.Point(x, y);
            paper.view.update();
            console.log(`Way point ID: ${id} updated to new coordinates: (${x}, ${y})`);
        }
    }
}
