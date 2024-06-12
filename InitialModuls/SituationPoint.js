export class SituationPoint {
    constructor(canvasId, scaleParameters) {
        this.canvas = document.getElementById(canvasId);
        this.scaleParameters = scaleParameters;
        if (this.canvas) {
            paper.setup(this.canvas);
            this.situationPoints = [];
            this.isActive = false;
            this.currentType = null; // Додана властивість для збереження типу ситуаційної точки

            this.boundClickHandler = this.handleClick.bind(this); // Зберігаємо прив'язаний обробник
        } else {
            console.error(`Canvas with id '${canvasId}' not found.`);
        }
    }

    setupListeners() {
        this.canvas.addEventListener('click', this.boundClickHandler);
    }

    removeListeners() {
        this.canvas.removeEventListener('click', this.boundClickHandler);
    }

    handleClick(event) {
        if (!this.isActive || event.button !== 0 || !this.currentType) return; // Only proceed for left-click

        const point = new paper.Point(event.offsetX, event.offsetY);
        this.addSituationPoint(point);
    }

    setCurrentType(type) {
        this.currentType = type;
    }

    generateSituationPointID() {
        const buildingID = this.scaleParameters.getBuildingID().toString().padStart(3, '0');
        const buildingLevel = this.scaleParameters.getBuildingLevel().toString().padStart(2, '0');
        const pointID = (this.situationPoints.length + 1).toString().padStart(3, '0');
        const typeInitial = this.currentType.charAt(0).toUpperCase();
        return `${buildingID}${buildingLevel}${pointID}${typeInitial}`;
    }

    drawSituationPoint(point, id, type) {
        this.currentType = type; // Встановлюємо тип для поточного завантаження
        const situationPointID = id || this.generateSituationPointID();
        const icon = this.getIconForType(this.currentType);

        const raster = new paper.Raster({
            source: 'data:image/svg+xml;base64,' + btoa(icon),
            position: point,
            scaling: 1.0, // Increased scaling to 1.0 to double the size
            onLoad: function() {
                this.position = point; // Ensure the position is correctly set after the image loads
            }
        });

        const existingSituationPoint = this.situationPoints.find(sp => sp.id === situationPointID);
        if (!existingSituationPoint) {
            this.situationPoints.push({ id: situationPointID, type: this.currentType, x: point.x, y: point.y, point: raster });
            console.log(`Added situation point ID: ${situationPointID}, Type: ${this.currentType}, Coordinates: (${point.x}, ${point.y})`);
        } else {
            existingSituationPoint.point = raster; // Update existing point image
        }
        paper.view.update();
    }

    getIconForType(type) {
        switch (type) {
            case 'elevator':
                return this.createElevatorIconSVG(); // Example for default icon
            case 'stairs':
                return this.createStairsIconSVG(); // Path to the icon
            case 'fireExtinguisher':
                return this.createFireIconSVG(); // Path to the icon
            case 'waterCooler':
                return this.createDropIconSVG(); // Drop icon for water cooler
            default:
                return null;
        }
    }

    createFireIconSVG() {
        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="25" height="25">
            <circle cx="25" cy="25" r="25" fill="#E91E63" />
            <path d="M32.5,20 l-2.5,-2.5 a2.5,2.5 0 0,1 0,-5 l2.5,-2.5 m0,5 l-2.5,-2.5 m-15,20 l2.5,-2.5 a2.5,2.5 0 0,1 5,0 l2.5,2.5 m0,-10 l-2.5,-2.5 m-5,2.5 l-2.5,-2.5 a2.5,2.5 0 0,0 -5,0 l-2.5,2.5 m0,10 l2.5,2.5 a2.5,2.5 0 0,0 5,0 l2.5,-2.5" fill="white"/>
            <path d="M25,10 a5,5 0 0,1 0,10 a5,5 0 0,1 0,-10" fill="white"/>
            <path d="M27.5,17.5 l0,-5 a2.5,2.5 0 0,0 -5,0 l0,5 m2.5,0 l0,2.5 a2.5,2.5 0 0,0 5,0 l0,-2.5" fill="#E91E63"/>
            <path d="M20,27.5 a2.5,2.5 0 0,1 5,0 a2.5,2.5 0 0,1 -5,0" fill="#E91E63"/>
            <path d="M22.5,27.5 l0,7.5 a2.5,2.5 0 0,1 -5,0 l0,-7.5" fill="white"/>
        </svg>
        `;
        return svg;
    }

    createElevatorIconSVG() {
        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="25" height="25">
            <rect x="10" y="10" width="30" height="30" stroke="black" stroke-width="2" fill="none"/>
            <rect x="20" y="15" width="5" height="20" stroke="black" stroke-width="2" fill="none"/>
            <rect x="25" y="15" width="5" height="20" stroke="black" stroke-width="2" fill="none"/>
            <path d="M20 35 L30 35" stroke="black" stroke-width="2" />
            <path d="M15 15 L20 10 L25 15" stroke="black" stroke-width="2" />
            <path d="M25 15 L30 10 L35 15" stroke="black" stroke-width="2" />
            <circle cx="35" cy="35" r="1.5" fill="black"/>
            <circle cx="35" cy="38" r="1.5" fill="black"/>
        </svg>
        `;
        return svg;
    }

    createDefaultIconSVG() {
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <circle cx="12" cy="12" r="10" stroke="black" stroke-width="2" fill="white" />
                <path d="M12 2C10.89 2 10 2.9 10 4C10 5.1 10.89 6 12 6C13.11 6 14 5.1 14 4C14 2.9 13.11 2 12 2ZM12 8C9.33 8 7 10.33 7 13C7 15.67 9.33 18 12 18C14.67 18 17 15.67 17 13C17 10.33 14.67 8 12 8Z" fill="blue" />
            </svg>
        `;
        return svg;
    }

    createStairsIconSVG() {
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="25" height="25">
                <path d="M10 40H16V34H22V28H28V22H34V16H40" stroke="black" stroke-width="2" fill="none"/>
                <path d="M12 16L18 22M18 22H12M18 22V16" stroke="black" stroke-width="2" fill="none"/>
                <path d="M38 32L32 26M32 26H38M32 26V32" stroke="black" stroke-width="2" fill="none"/>
            </svg>
        `;
        return svg;
    }



    createDropIconSVG() {
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25" width="25" height="25">
                <path d="M12.5 0C9.5 3.85 3.75 10.25 3.75 15C3.75 20.7 7.8 25 12.5 25S21.25 20.7 21.25 15C21.25 10.25 15.5 3.85 12.5 0Z" fill="blue"/>
            </svg>
        `;
        return svg;
    }

    addSituationPoint(point, id = null, type = null) {
        if (type) {
            this.setCurrentType(type);
        }

        if (!this.currentType) {
            console.error('Current type for situation point is not set.');
            return;
        }

        this.drawSituationPoint(point, id, this.currentType);
    }

    getSituationPoints() {
        return this.situationPoints;
    }

    // Get the last added situation point
    getLastSituationPoint() {
        return this.situationPoints.length > 0 ? this.situationPoints[this.situationPoints.length - 1] : null;
    }

    activate(type) {
        this.isActive = true;
        this.currentType = type;
        this.setupListeners();
        console.log(`${type} tool activated`);
    }

    deactivate() {
        this.isActive = false;
        this.currentType = null;
        this.removeListeners();
        console.log('Situation Point tool deactivated');
    }

    createSituationPointsTable() {
        const situationPoints = this.getSituationPoints();
        const table = document.createElement('table');
        table.setAttribute('border', '1');

        const headerRow = document.createElement('tr');
        const headers = ['ID', 'Type', 'X', 'Y'];
        headers.forEach(headerText => {
            const header = document.createElement('th');
            const textNode = document.createTextNode(headerText);
            header.appendChild(textNode);
            headerRow.appendChild(header);
        });
        table.appendChild(headerRow);

        situationPoints.forEach(point => {
            const row = document.createElement('tr');

            const idCell = document.createElement('td');
            idCell.textContent = point.id;
            row.appendChild(idCell);

            const typeCell = document.createElement('td');
            typeCell.textContent = point.type;
            row.appendChild(typeCell);

            const xCell = document.createElement('td');
            xCell.textContent = point.x.toFixed(2);
            row.appendChild(xCell);

            const yCell = document.createElement('td');
            yCell.textContent = point.y.toFixed(2);
            row.appendChild(yCell);

            table.appendChild(row);
        });

        const existingModal = document.getElementById('situationPointsModal');
        if (existingModal) {
            document.body.removeChild(existingModal);
        }

        const modal = document.createElement('div');
        modal.id = 'situationPointsModal';
        modal.style.cssText = `
            position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%);
            z-index: 100; padding: 20px; background: white; border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);`;
        modal.appendChild(table);

        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.addEventListener('click', () => document.body.removeChild(modal));
        modal.appendChild(closeButton);

        document.body.appendChild(modal);
    }
}
