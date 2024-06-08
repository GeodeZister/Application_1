class RasterScaleModule {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.image = new Image();
        this.points = [];
        this.originalScaleCalculated = false;
        this.originalPixelToMeter = null;
        this.zoomLevel = 1; // Початковий рівень зуму
        this.coordinatesSystemActive = false; // Чи активована система координат
        this.coordinateGrid = null; // Інформація про координатну сітку
        this.originInPixels = null;
        this.gridEnabled = false; // Стан відображення координатної сітки
        this.originalScale = null; // Коефіцієнт початкового масштабу
        this.pixelDistanceScale = null; // Початкова відстань між точками у пікселях
        this.realDistanceScale = null;
        this.setupListeners();


    }

    loadImage(url) {
    this.image.onload = () => {
            // Оновлення масштабу зображення з урахуванням zoomLevel
            this.updateCanvasSize();
            this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
            this.centerCanvas();

            this.logImageName(url); // Додаємо цей рядок
        };
        this.image.src = url;
    }

    logImageName(imageUrl) {
        const imageName = imageUrl.split('/').pop(); // Екстрактуємо ім'я файлу з URL
        this.log(`Image uploaded: ${imageName}`); // Викликаємо метод log для додавання інформації до логу
    }

    updateCanvasSize() {
        // Оновлення розмірів холста відповідно до поточного zoomLevel
        this.canvas.width = this.image.width * this.zoomLevel;
        this.canvas.height = this.image.height * this.zoomLevel;
    }

    centerCanvas() {
        const container = this.canvas.parentElement;
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        container.style.height = '100vh';
    }

    handleRulerClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / this.zoomLevel;
        const y = (e.clientY - rect.top) / this.zoomLevel;

        // Додаємо точку для Ruler Tool
        this.addPoint(x, y);
        // Якщо вибрано дві точки, вимірюємо відстань між ними
        if (this.points.length === 2) {
            this.measureDistance();
            this.points = []; // Очищуємо точки після вимірювання відстані для наступних вимірювань
        }
    }

    setupListeners() {
        document.getElementById('loadImageButton').addEventListener('click', () => {
            const imageUrl = 'https://i.ibb.co/T4pjHw7/photo-2024-02-12-09-47-30.jpg';
            this.loadImage(imageUrl);
        });

        document.getElementById('addCoordinatesSystemButton').addEventListener('click', () => {
            this.setupCoordinateSystem();
        });

        document.getElementById('toggleGridButton').addEventListener('click', () => {
            this.gridEnabled = !this.gridEnabled; // Переключення стану сітки
            this.redrawImage(); // Перемалювати зображення з урахуванням нового стану сітки
        });

        document.getElementById('applyGridStepButton').addEventListener('click', () => {
            const newStep = parseFloat(document.getElementById('gridStepInput').value);
            if (!isNaN(newStep) && newStep > 0) {
                this.gridStep = newStep;
                this.redrawImage(); // Перемалювати зображення та сітку з новим кроком
            } else {
                alert("Некоректне значення кроку сітки.");
            }
        });

        this.canvas.addEventListener('click', (e) => {
            if (this.rulerActive) {
                this.handleRulerClick(e);
            } else if (this.scalingActive) {
                this.handleScalingClick(e);
            } else if (this.coordinatesSystemActive) {
                this.handleCoordinateSystemClick(e);
            } else {
                this.handleCanvasClick(e);
            }
        });

        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.handleZoom(e.deltaY, e.clientX, e.clientY);
        });

        ['rulerButton', 'scalingButton'].forEach(buttonId => {
            document.getElementById(buttonId).addEventListener('click', () => this.toggleTool(buttonId));
        });

        document.getElementById('applyScaleButton').addEventListener('click', () => {
            const manualScaleValue = document.getElementById('manualScaleInput').value;
            this.applyManualScale(manualScaleValue);
        });

        document.getElementById('addCoordinatesSystemButton').addEventListener('click', () => {
            this.setupCoordinateSystem();
        });
    }






    displayCoordinates(x, y, cursorX, cursorY) {
        const coordinateDisplay = document.getElementById('coordinateDisplay');
        coordinateDisplay.style.display = 'block';
        coordinateDisplay.style.left = `${cursorX + 15}px`;
        coordinateDisplay.style.top = `${cursorY + 15}px`;
        coordinateDisplay.textContent = `Координати: (${x}, ${y})`;
    }

    clearCoordinateDisplay() {
        const coordinateDisplay = document.getElementById('coordinateDisplay');
        coordinateDisplay.style.display = 'none';
    }

    applyManualScale(scaleStr) {
    // Перевірка введення користувача
        const newScale = parseFloat(scaleStr); // Перетворення рядка в число
        if (isNaN(newScale) || newScale <= 0) {
            alert("Invalid scale. Please enter a positive number.");
            return;
        }

        // Використання збережених значень для обрахунку нової відстані між точками
        const realDistanceMeters = this.realDistanceScale; // Реальна відстань між точками, наприклад, 100 метрів
        const newPixelDistance = realDistanceMeters / newScale; // Обрахунок нової відстані в пікселях

        // Застосування нового масштабу до зображення
        this.adjustImageScale(newPixelDistance);
    }


    handleCanvasClick(x, y) {
        if (this.coordinatesSystemActive) {
            const coord = prompt("Введіть координату для цієї точки (формат: x,y):");
            if (coord) {
                const [coordX, coordY] = coord.split(',').map(n => parseFloat(n));
                if (!isNaN(coordX) && !isNaN(coordY)) {
                    this.coordinateGrid = { origin: { x, y }, coordX, coordY };
                    this.drawCoordinateGrid();
                    this.coordinatesSystemActive = false;
                    this.canvas.style.cursor = 'default'; // Повернення курсору до стандартного вигляду
                } else {
                    alert("Некоректний формат координат.");
                }
            } else {
                this.coordinatesSystemActive = false;
                this.canvas.style.cursor = 'default';
            }
            return; // Вихід, щоб не виконувати інші дії для кліку
        }

        if (this.points.length < 2) {
            this.addPoint(x, y);
            if (this.points.length === 2 && this.rulerActive) {
                this.measureDistance();
            } else if (this.points.length === 2 && this.scalingActive) {
                this.performScaling();
            }
        }
    }


    drawCoordinateGrid() {
        if (!this.originInPixels) return; // Якщо координати початку не встановлено, не малюємо сітку

        const step = 50; // Крок сітки в пікселях
        const width = this.canvas.width;
        const height = this.canvas.height;
        const origin = this.originInPixels;

        this.ctx.beginPath();
        for (let x = origin.x % step; x < width; x += step) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
        }
        for (let y = origin.y % step; y < height; y += step) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
        }
        this.ctx.strokeStyle = '#AAA'; // Колір ліній сітки
        this.ctx.stroke();
    }


    handleCoordinateSystemClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) / this.zoomLevel; // Нормалізація координати кліку
        const y = (event.clientY - rect.top) / this.zoomLevel; // до координат зображення

        const coord = prompt("Введіть координату для цієї точки (формат: X,Y):");
        if (coord) {
            const [inputX, inputY] = coord.split(',').map(n => parseFloat(n));
            if (!isNaN(inputX) && !isNaN(inputY)) {
                // Якщо введено 0,0, зберігаємо безпосередньо координати кліку
                if (inputX === 0 && inputY === 0) {
                    this.originInPixels = { x, y };
                } else {
                    // Інакше обраховуємо координати для (0,0) на основі введення та масштабу
                    const pixelsPerUnit = this.calculatePixelsPerUnit();
                    const originX = x - inputX * pixelsPerUnit;
                    const originY = y - inputY * pixelsPerUnit;
                    this.originInPixels = { x: originX, y: originY };
                }
                this.log(`Оновлено координати початку системи: (${this.originInPixels.x.toFixed(2)}, ${this.originInPixels.y.toFixed(2)})`);
                // Перемалювання, якщо потрібно, для візуалізації змін
                this.redrawImage();
            } else {
                alert("Некоректний формат координат.");
            }
        }
    }

    calculatePixelsPerUnit() {
        // Обрахунок кількості пікселів на одиницю довжини на основі збереженого масштабу
        // Це припущення, що `this.originalScale` визначає співвідношення пікселів до реальних одиниць довжини
        // Наприклад, якщо `this.originalScale` = 2, тоді 1 одиниця довжини в реальному світі відповідає 2 пікселям на зображенні
        return 1 / this.originalScale; // Змініть цю логіку відповідно до вашого визначення масштабу
    }


    handleZoom(deltaY, clientX, clientY) {
        const zoomIntensity = 0.1;
        const direction = deltaY < 0 ? 1 : -1;
        const factor = 1 + direction * zoomIntensity;

        // Розрахунок нового zoomLevel без втрати позиції точки 0.0
        this.zoomLevel *= factor;

        // Забезпечення, щоб масштаб не ставав надто малим або надто великим
        if (this.zoomLevel < 0.1) this.zoomLevel = 0.1;
        if (this.zoomLevel > 10) this.zoomLevel = 10; // Припустимо, максимальний зум

        // Переміщення холсту, щоб точка 0.0 залишалася на місці
        if (this.coordinateGrid && this.coordinateGrid.origin) {
            const { origin } = this.coordinateGrid;
            const offsetX = (clientX - origin.x) * (factor - 1);
            const offsetY = (clientY - origin.y) * (factor - 1);

            this.coordinateGrid.origin.x -= offsetX;
            this.coordinateGrid.origin.y -= offsetY;
        }

        this.updateCanvasSize();
        this.redrawImage(); // Перемалювання зображення та сітки з новим масштабом
    }

    toggleTool(toolId) {
        // Скидання активності всіх інструментів
        this.rulerActive = false;
        this.scalingActive = false;
        this.coordinatesSystemActive = false; // Припустимо, що ви хочете також деактивувати цей режим

        // Активація обраного інструменту
        if (toolId === 'rulerButton') {
            this.rulerActive = true;
        } else if (toolId === 'scalingButton') {
            this.scalingActive = true;
        } else if (toolId === 'coordinatesSystemButton') {
            this.coordinatesSystemActive = true; // Припустимо, що ви маєте кнопку для активації системи координат
        }

        // Візуальні індикатори активності інструментів
        document.getElementById('rulerButton').classList.toggle('active', this.rulerActive);
        document.getElementById('scalingButton').classList.toggle('active', this.scalingActive);
        // Інші індикатори за потреби...

        this.points = []; // Очищення вибраних точок при зміні інструменту
        this.canvas.style.cursor = 'default'; // Скидання курсору, якщо потрібно
    }


    redrawImage() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Очищення холста
        this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height); // Перемалювання зображення

        // Перевірка, чи потрібно відображати координатну сітку
        if (this.gridEnabled && this.originInPixels) {
            this.drawCoordinateGrid();
        }

        // Відображення точок або маркерів
        this.points.forEach(point => {
            this.drawPoint(point.x * this.zoomLevel, point.y * this.zoomLevel); // Врахування zoomLevel
        });

        // Відображення точки початку координат, якщо вона була встановлена
        if (this.originPoint) {
            this.drawOriginPoint();
        }
    }


    drawPoint(x, y) {
        // Візуалізація точки на холсті
        this.ctx.fillStyle = 'red';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 5, 0, Math.PI * 2, true); // Малюємо круг радіусом 5 пікселів
        this.ctx.fill();
    }



    addPoint(x, y) {
        // Додаємо точку до списку, переконуючись, що додаємо не більше двох точок
        if (this.points.length < 2) {
            this.points.push({ x, y });
            this.log(`Point ${this.points.length}: (${x.toFixed(1)}, ${y.toFixed(1)})`);
            // Відображаємо точку на холсті
            this.ctx.fillStyle = 'red';
            this.ctx.beginPath();
            this.ctx.arc(x * this.zoomLevel, y * this.zoomLevel, 5, 0, 2 * Math.PI); // Врахування zoomLevel для візуалізації
            this.ctx.fill();
        }
    }

    performScaling() {
        if (this.points.length === 2) {
            const pixelDistance = this.calculatePixelDistance();
            const realDistanceMeters = parseFloat(prompt("Enter the real-world distance between the points in meters (to the nearest 0.1m):"));

            // Перевірка, чи користувач ввів валідне значення відстані
            if (!isNaN(realDistanceMeters) && realDistanceMeters > 0) {
                // Зберігання обчислених даних
                this.originalScale = pixelDistance / realDistanceMeters; // Коефіцієнт масштабу
                this.pixelDistanceScale = pixelDistance; // Відстань у пікселях
                this.realDistanceScale = realDistanceMeters; // Реальна відстань
                this.originalScaleCalculated = true; // Вказуємо, що початковий масштаб було встановлено

                this.logOriginalScale(); // Логування або відображення інформації

                // Очищуємо список точок після проведення масштабування
                this.points = [];
                // Вимкнення інструменту масштабування
                this.scalingActive = false;
                // Візуальне позначення, що інструмент масштабування більше не активний
                document.getElementById('scalingButton').classList.remove('active');
            } else {
                alert("Please enter a valid real-world distance.");
            }
        }
    }


    logOriginalScale() {
        const scaleRatio = (1 / this.originalScale).toFixed(2);
        this.log(`Current Image Scale: 1:${scaleRatio}`);
        this.log(`Initial pixel distance: ${this.pixelDistanceScale.toFixed(1)} pixels`);
        this.log(`Real-world distance: ${this.realDistanceScale.toFixed(1)} meters`);
    }

        adjustImageToNewScale(newScaleRatio) {
        // Перевірка, чи було встановлено початковий масштаб
        if (!this.originalScaleCalculated) {
            alert("Please set the initial scale by measuring a known distance first.");
            return;
        }

        const adjustmentFactor = this.originalPixelToMeter * newScaleRatio;

        // Застосування нового масштабу до зображення
        this.zoomLevel = adjustmentFactor; // Оновлення zoomLevel для масштабування зображення
        this.updateCanvasSize(); // Оновлення розмірів холста
        this.redrawImage(); // Перемалювання зображення з новим масштабом

        // Виведення інформації про зміну масштабу
        this.log(`Adjusted Image Scale to 1:${newScaleRatio}`);
    }

    calculatePixelDistance() {
        // Розрахунок відстані між двома точками в пікселях
        if (this.points.length === 2) {
            const dx = this.points[1].x - this.points[0].x;
            const dy = this.points[1].y - this.points[0].y;
            return Math.sqrt(dx * dx + dy * dy);
        } else {
            console.error("Cannot calculate distance: Insufficient or invalid points");
            return 0; // Повертаємо 0 у випадку помилки
        }
    }

    measureDistance() {
        if (this.points.length === 2) {
            const pixelDistance = this.calculatePixelDistance();
            this.log(`Measured Distance: ${pixelDistance.toFixed(1)} pixels`);
            // Тут можна додати перетворення піксельної відстані в реальні одиниці

            // Очищуємо список точок після вимірювання відстані
            this.points = [];

            // Вимкнення інструменту вимірювання відстані
            this.rulerActive = false;

            // Візуальне позначення, що інструмент вимірювання відстані більше не активний
            document.getElementById('rulerButton').classList.remove('active');
        }
    }

    onCanvasClickForCoordinates(event) {
        if (!this.coordinatesSystemActive) return;

        // Визначення координат кліку
        const rect = this.canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) / this.zoomLevel;
        const y = (event.clientY - rect.top) / this.zoomLevel;

        // Запит введення координат
        const coord = prompt("Введіть координату для цієї точки (формат: x,y):");
        if (coord) {
            const [inputX, inputY] = coord.split(',').map(n => parseFloat(n));
            if (!isNaN(inputX) && !isNaN(inputY)) {
                // Встановлення початкової точки системи координат
                this.setOriginBasedOnInput(x, y, inputX, inputY);
                this.coordinatesSystemActive = false; // Деактивація режиму
                this.canvas.style.cursor = 'default';
            } else {
                alert("Некоректний формат координат.");
            }
        }
    }

    handleScalingClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / this.zoomLevel;
        const y = (e.clientY - rect.top) / this.zoomLevel;

        // Додаємо точку для Scaling Tool
        this.addPoint(x, y);

        // Якщо вибрано дві точки, проводимо масштабування
        if (this.points.length === 2) {
            // Тут код для масштабування, наприклад, виклик методу performScaling
            this.performScaling();
            // Очищуємо список точок після проведення масштабування
            this.points = [];
        }
    }


    setOriginBasedOnInput(clickedX, clickedY, inputX, inputY) {
        if (inputX === 0 && inputY === 0) {
            this.originInPixels = { x: clickedX, y: clickedY };
            // Зберігаємо координати для відображення точки початку координат без зміни масштабу
            this.originPoint = { x: clickedX * this.zoomLevel, y: clickedY * this.zoomLevel };
        } else {
            // Якщо координати не (0,0), розрахувати позицію (0,0) на холсті з урахуванням масштабу
            const pixelsPerUnit = 1 / this.originalPixelToMeter;
            const originX = clickedX - inputX * pixelsPerUnit;
            const originY = clickedY - inputY * pixelsPerUnit;
            this.originInPixels = { x: originX, y: originY };
            // Зберігаємо координати для відображення точки початку координат з урахуванням обрахунку місця (0,0)
            this.originPoint = { x: originX * this.zoomLevel, y: originY * this.zoomLevel };
        }

        this.log("Система координат успішно встановлена.");

        // Відключення активності режиму встановлення координатної системи
        this.coordinatesSystemActive = false;

        // Оновлення візуального стану кнопки (якщо є така потреба)
        if (document.getElementById('addCoordinatesSystemButton')) {
            document.getElementById('addCoordinatesSystemButton').classList.remove('active');
        }

        // Відновлення курсору до стандартного вигляду
        this.canvas.style.cursor = 'default';

        // Оновлення холста для відображення змін, включаючи нову точку початку координат
        this.redrawImage();
    }

    drawOriginPoint() {
        this.ctx.fillStyle = 'blue'; // Колір точки початку координат
        this.ctx.beginPath();
        this.ctx.arc(this.originPoint.x, this.originPoint.y, 5, 0, Math.PI * 2); // Малюємо круг радіусом 5 пікселів
        this.ctx.fill();

        // Опційно: додавання текстової підписки для точки (наприклад, "0,0")
        this.ctx.font = "12px Arial";
        this.ctx.fillText("(0,0)", this.originPoint.x + 7, this.originPoint.y - 7); // Зміщення тексту відносно точки
    }

    setupCoordinateSystem() {
        this.coordinatesSystemActive = true;
        this.canvas.style.cursor = 'crosshair'; // Зміна курсору для вказівки точки
    }

    log(message) {
        // Логування повідомлення до елементу з ідентифікатором "logWindow" або до консолі
        const logWindow = document.getElementById("logWindow");
        if (logWindow) {
            logWindow.innerHTML += `<p>${message}</p>`;
            logWindow.scrollTop = logWindow.scrollHeight; // Автопрокрутка до останнього повідомлення
        } else {
            console.log(message); // Вивід у консоль, якщо елемент не знайдено
        }
    }

}

document.addEventListener('DOMContentLoaded', () => {
    new RasterScaleModule('imageCanvas');
})