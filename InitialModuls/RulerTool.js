export class RulerTool {
    constructor(canvas, logFunction) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.log = logFunction;
        this.points = [];
        this.boundHandleClick = this.handleClick.bind(this); // Зберігаємо зв'язану версію handleClick
    }

    activate() {
        this.canvas.addEventListener('click', this.boundHandleClick); // Використовуємо зв'язану функцію
    }

    deactivate() {
        this.canvas.removeEventListener('click', this.boundHandleClick); // Видаляємо зв'язану функцію
        this.points = [];
    }

    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        this.addPoint(x, y);
    }

    addPoint(x, y) {
        if (this.points.length < 2) {
            this.points.push({ x, y });
            this.log(`Point ${this.points.length}: (${x.toFixed(1)}, ${y.toFixed(1)})`);

            // Візуалізація точки на канвасі
            this.drawPoint(x, y);

            // Якщо дві точки додані, вимірюємо відстань
            if (this.points.length === 2) {
                this.measureDistance();
                this.points = []; // Очищуємо точки для нового вимірювання
            }
        }
    }

    drawPoint(x, y) {
        this.ctx.fillStyle = 'red'; // Колір точки
        this.ctx.beginPath();
        this.ctx.arc(x, y, 5, 0, Math.PI * 2); // Малюємо круг радіусом 5 пікселів
        this.ctx.fill();
    }

    measureDistance() {
        if (this.points.length === 2) {
            const dx = this.points[1].x - this.points[0].x;
            const dy = this.points[1].y - this.points[0].y;
            const pixelDistance = Math.sqrt(dx * dx + dy * dy);
            this.log(`Measured Distance: ${pixelDistance.toFixed(1)} pixels`);

            this.deactivate();
        }
    }
}
