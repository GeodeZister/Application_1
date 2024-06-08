//CoordinateSystem.js
export class CoordinateSystem {
    constructor(canvas, logFunction, scaleParameters) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.log = logFunction;
        this.scaleParameters = scaleParameters;
        this.boundHandleClick = this.handleClick.bind(this);
        this.boundHandleMouseMove = this.handleMouseMove.bind(this);
        this.checkCoordinatesMode = false;

    }

    addPoint(x, y, inputXY, positionXY) {
        // Додає координати до ScaleParameters
        this.scaleParameters.addCoordinates(inputXY, positionXY);
    }

    activateCheckCoordinates() {
        // Активувати режим перевірки координат
        this.checkCoordinatesMode = true;
        this.canvas.addEventListener('mousemove', this.boundHandleMouseMove);
    }

    deactivateCheckCoordinates() {
        // Деактивувати режим перевірки координат
        this.checkCoordinatesMode = false;
        this.canvas.removeEventListener('mousemove', this.boundHandleMouseMove);
    }

    handleMouseMove(event) {
        if (!this.checkCoordinatesMode) return;

        const rect = this.canvas.getBoundingClientRect();
        const xPixel = event.clientX - rect.left;
        const yPixel = event.clientY - rect.top;
        const origin = this.scaleParameters.getOriginPosition() || { x: 0, y: 0 };
        const pixelsPerMeter = this.scaleParameters.getPixelsPerMeter() || 100;
        const xLocal = (xPixel - origin.x) / pixelsPerMeter; // Спочатку обчислюємо xLocal
        const yLocal = (yPixel - origin.y) / pixelsPerMeter; // Обчислюємо yLocal

        // Після обчислення значень оновлюємо текстовий вміст
        document.getElementById('pixelCoordinates').textContent = `Pixel Coordinates: ${xPixel.toFixed(0)}px, ${yPixel.toFixed(0)}px`;
        document.getElementById('localCoordinates').textContent = `Local Coordinates: ${xLocal.toFixed(2)}m, ${yLocal.toFixed(2)}m`;
    }

    activate() {
        if (!this.isActive) {
            console.log("Activating CoordinateSystem");
            this.canvas.addEventListener('click', this.boundHandleClick);
            this.isActive = true;
        }
    }

    deactivate() {
        if (this.isActive) {
            console.log("Deactivating CoordinateSystem");
            this.canvas.removeEventListener('click', this.boundHandleClick);
            this.isActive = false;
        }
    }

    handleClick(event) {
        console.log("Clicked for coordinates");
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        this.promptForCoordinates(x, y);
    }

    promptForCoordinates(x, y) {
        if (!this.isActive) return; // Переконайтесь, що інструмент активний

        const input = prompt("Enter coordinates for this point in the format (X,Y):", "");
        if (!input) return; // Якщо користувач натиснув Cancel

        const [xInput, yInput] = input.split(',').map(num => parseFloat(num.trim()));
        if (!isNaN(xInput) && !isNaN(yInput)) {
            this.log(`Coordinates: (${xInput}, ${yInput}) for point at (${x.toFixed(1)}, ${y.toFixed(1)})`);

            const inputXY = { x: xInput, y: yInput };
            const positionXY = { x: x.toFixed(1), y: y.toFixed(1) };

            this.calculateAndDrawOrigin(positionXY, inputXY);
            this.addPoint(x, y, inputXY, positionXY);
            this.drawPoint(x, y);

            this.deactivate(); // Деактивувати інструмент після введення координат
        } else {
            this.log("Invalid coordinates entered.");
        }
    }



    calculateAndDrawOrigin(positionXY, inputXY) {
        // Отримання кількості пікселів на метр безпосередньо з ScaleParameters
        const MeasuredPixel = this.scaleParameters.getMeasuredPixelDistanceForScaling();
        const measuredPixel = parseFloat(MeasuredPixel);
        const RealDistance = this.scaleParameters.getRealDistance();
        const realDistance = parseFloat(RealDistance);
        const pixelsPerMeter = measuredPixel/realDistance;// Значення за замовчуванням, на випадок якщо не вдалося отримати масштаб
        console.log(`Pixels per meter: ${pixelsPerMeter}`);

        // Використовуємо отримане значення для обчислення зміщення в пікселях
        const deltaX = inputXY.x * pixelsPerMeter;
        const deltaY = inputXY.y * pixelsPerMeter;

        // Обчислення та оновлення позиції (0,0)
        const originX = positionXY.x - deltaX;
        const originY = positionXY.y - deltaY;
        this.scaleParameters.setOriginPosition(originX, originY);
        this.drawPointOrigin(originX, originY);

    }

    drawPoint(x, y) {
        this.ctx.fillStyle = 'blue';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 5, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawPointOrigin(x, y) {
        this.ctx.fillStyle = 'green';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 5, 0, Math.PI * 2);
        this.ctx.fill();
    }
}
