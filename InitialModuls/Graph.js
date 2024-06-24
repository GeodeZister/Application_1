export class Graph {
    constructor() {
        this.points = [];
        this.edges = [];
    }

    collectPoints(wayPoints, situationPoints) {
        // Додаємо тип "waypoint" для кожної точки шляху
        const formattedWayPoints = wayPoints.map(point => ({
            ...point,
            type: 'waypoint'
        }));

        // Додаємо всі точки до масиву
        this.points = [...formattedWayPoints, ...situationPoints];
        this.calculateEdges();
        this.logSuccess();
    }

    calculateEdges() {
        this.edges = [];
        for (let i = 0; i < this.points.length; i++) {
            for (let j = i + 1; j < this.points.length; j++) {
                const distance = this.calculateDistance(this.points[i], this.points[j]);
                this.edges.push({
                    from: this.points[i].id,
                    to: this.points[j].id,
                    weight: distance
                });
            }
        }
    }

    calculateDistance(point1, point2) {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    logSuccess() {
        console.log("Успішно виконанно");
        console.log("Зібрані точки:", this.points);
        console.log("Зібрані ребра:", this.edges);
    }
}
