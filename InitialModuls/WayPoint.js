// WayPoint.js
export class WayPoint {
    constructor(canvasId, scaleParameters) {
        this.canvas = document.getElementById(canvasId);
        this.scaleParameters = scaleParameters;
        if (this.canvas) {
            paper.setup(this.canvas);
            this.wayPoints = [];
            this.isActive = false;
            this.isVisible = true; // Додана властивість для видимості точок

            this.setupListeners();
        } else {
            console.error(`Canvas with id '${canvasId}' not found.`);
        }
    }

    setupListeners() {
        this.canvas.addEventListener('click', (event) => {
            if (!this.isActive || event.button !== 0) return; // Only proceed for left-click

            const point = new paper.Point(event.offsetX, event.offsetY);
            this.addWayPoint(point);
        });

        this.canvas.addEventListener('contextmenu', (event) => {
            if (!this.isActive) return;

            event.preventDefault(); // Prevent the context menu from appearing
            this.removeLastWayPoint();
        });
    }

    generateWayPointID() {
        const buildingID = this.scaleParameters.getBuildingID().toString().padStart(3, '0');
        const buildingLevel = this.scaleParameters.getBuildingLevel().toString().padStart(2, '0');
        const pointID = (this.wayPoints.length + 1).toString().padStart(3, '0');
        return `${buildingID}${buildingLevel}${pointID}`;
    }

    drawWayPoint(point, id) {
        const wayPointID = id || this.generateWayPointID();
        const outerCircle = new paper.Path.Circle(point, 6);
        outerCircle.strokeColor = 'black';
        outerCircle.fillColor = 'black';

        const innerCircle = new paper.Path.Circle(point, 3);
        innerCircle.strokeColor = 'yellow';
        innerCircle.fillColor = 'yellow';

        const group = new paper.Group([outerCircle, innerCircle]);

        // Перевірка, чи точка вже існує, щоб уникнути дублювання
        const existingWayPoint = this.wayPoints.find(wp => wp.id === wayPointID);
        if (!existingWayPoint) {
            this.wayPoints.push({ id: wayPointID, x: point.x, y: point.y, point: group });
            console.log(`Added way point ID: ${wayPointID}, Coordinates: (${point.x}, ${point.y})`);
        } else {
            existingWayPoint.point = group; // Оновлюємо зображення існуючої точки
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

    // Calculate the distance between two points
    calculateDistance(point1, point2) {
        return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
    }

    // Find the nearest two neighbors for a given point
    findNearestNeighbors(targetPoint) {
        if (this.wayPoints.length < 3) {
            console.log('Not enough way points to find neighbors.');
            return [];
        }

        const distances = this.wayPoints.map(wayPoint => ({
            id: wayPoint.id,
            x: wayPoint.x,
            y: wayPoint.y,
            distance: this.calculateDistance(targetPoint, wayPoint)
        }));

        // Sort by distance and exclude the target point itself
        const sortedDistances = distances
            .filter(d => d.distance !== 0)
            .sort((a, b) => a.distance - b.distance);

        // Return the nearest two neighbors
        return sortedDistances.slice(0, 2);
    }

    // Get the last added way point
    getLastWayPoint() {
        return this.wayPoints.length > 0 ? this.wayPoints[this.wayPoints.length - 1] : null;
    }

    activate() {
        this.isActive = true;
        console.log('Way Point tool activated');
    }

    deactivate() {
        this.isActive = false;
        console.log('Way Point tool deactivated');
    }

    toggleVisibility() {
        this.isVisible = !this.isVisible;
        this.wayPoints.forEach(wp => {
            wp.point.visible = this.isVisible;
        });
        paper.view.update();
    }
}
