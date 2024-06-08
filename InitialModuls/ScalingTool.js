//ScalingTool.js
export class ScalingTool {
    constructor(canvas, logFunction, scaleParameters, redrawFunction) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.log = logFunction;
        this.scaleParameters = scaleParameters;
        this.redraw = redrawFunction; // Зберігання переданої функції перерисовки
        this.points = [];
        this.isActive = false;
        this.boundHandleClick = this.handleClick.bind(this);
    }

    activate() {
        if (!this.isActive) {
            this.canvas.addEventListener('click', this.boundHandleClick);
            this.isActive = true;
        } else {
            // Якщо інструмент вже активний, запитати користувача, чи він хоче деактивувати інструмент
            if (confirm("Do you want to deactivate the scaling tool and clear the points?")) {
                this.deactivate();
            }
        }
    }

    deactivate() {
        this.canvas.removeEventListener('click', this.boundHandleClick);
        this.points = []; // Ensure this is supposed to be cleared here
        this.isActive = false;
        this.redraw(); // Ensure redraw() handles an empty or missing 'points' array gracefully
    }


    clearPoints() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Тут може бути потрібно додатково перерисувати зображення або інші елементи, які мають бути на канвасі
    }

    handleClick(event) {
        console.log('Handle click activated'); // Debugging line
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        this.addPoint(x, y);

        if (this.points.length === 2) {
            this.performScaling();
        }
    }

    addPoint(x, y) {
        if (this.points.length < 2) {
            this.points.push({ x, y });
            this.log(`Point ${this.points.length}: (${x.toFixed(1)}, ${y.toFixed(1)})`);
            this.drawPoint(x, y);
        }
    }

    drawPoint(x, y) {
        console.log(`Drawing point at (${x}, ${y})`); // Debugging line
        this.ctx.fillStyle = 'red';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 5, 0, Math.PI * 2);
        this.ctx.fill();
    }

    calculatePixelDistance() {
        if (this.points.length === 2) {
            const dx = this.points[1].x - this.points[0].x;
            const dy = this.points[1].y - this.points[0].y;
            return Math.sqrt(dx * dx + dy * dy);
        }
        return 0;
    }

    performScaling() {
        const pixelDistance = this.calculatePixelDistance();
        const realDistance = prompt("Enter the real distance between the points in meters:");
        const realDistanceNum = parseFloat(realDistance);
        if (!isNaN(realDistanceNum) && realDistanceNum > 0) {
            const scaleRatio = pixelDistance / realDistanceNum;
            const scale = `1 meter = ${scaleRatio.toFixed(2)} pixels`;
            const measuredPixelDistanceForScaling = `${pixelDistance.toFixed(1)} pixels`;
            const realDistanceStr = `${realDistance} meters`;
            const scaleRatioStr = `1:${(1 / scaleRatio).toFixed(2)}`;

            // Логування інформації
            this.log(scale);
            this.log(measuredPixelDistanceForScaling);
            this.log(realDistanceStr);
            this.log(scaleRatioStr);

            // Оновлення ScaleParameters
            this.scaleParameters.setScaleParameters({
                scale: scale,
                measuredPixelDistanceForScaling: measuredPixelDistanceForScaling,
                realDistance: realDistanceNum, // Зберігаємо як число
                scaleRatio: scaleRatioStr
            });

            // Перерисування зображення
            this.redraw();

            // Деактивація інструменту та очищення точок
            this.deactivate();
        } else {
            this.log("Invalid real distance entered.");
            this.points = []; // Очищуємо точки для можливості повторного введення
        }
    }

}
