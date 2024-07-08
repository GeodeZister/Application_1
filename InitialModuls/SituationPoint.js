export class SituationPoint {
    constructor(canvasId, scaleParameters) {
        this.canvas = document.getElementById(canvasId);
        this.scaleParameters = scaleParameters;
        if (this.canvas) {
            paper.setup(this.canvas);
            this.situationPoints = [];
            this.isActive = false;
            this.currentType = null;
            this.iconData = null;

            this.boundClickHandler = this.handleClick.bind(this);
            this.boundRightClickHandler = this.handleRightClick.bind(this);
        } else {
            console.error(`Canvas with id '${canvasId}' not found.`);
        }
    }

    setupListeners() {
        this.canvas.addEventListener('click', this.boundClickHandler);
        this.canvas.addEventListener('contextmenu', this.boundRightClickHandler); // Listen for right-click events
    }

    removeListeners() {
        this.canvas.removeEventListener('click', this.boundClickHandler);
        this.canvas.removeEventListener('contextmenu', this.boundRightClickHandler); // Remove right-click event listener
    }

    handleClick(event) {
        if (!this.isActive || event.button !== 0 || !this.currentType) return;

        const point = new paper.Point(event.offsetX, event.offsetY);
        this.addSituationPoint(point);
    }

    handleRightClick(event) {
        event.preventDefault(); // Prevent the context menu from appearing
        if (this.isActive) {
            this.deactivate();
            console.log('Right-click detected: Situation Point tool deactivated');
        }
    }

    setCurrentType(type, iconData) {
        this.currentType = type;
        this.iconData = iconData;
    }

    generateSituationPointID() {
        const buildingID = this.scaleParameters.getBuildingID().toString().padStart(3, '0');
        const buildingLevel = this.scaleParameters.getBuildingLevel().toString().padStart(2, '0');
        const pointID = (this.situationPoints.length + 1).toString().padStart(3, '0');
        const typeInitial = this.currentType.charAt(0).toUpperCase();
        return `${buildingID}${buildingLevel}${pointID}${typeInitial}`;
    }

    addSituationPoint(point, id = null, type = null, iconData = null) {
        if (type) {
            this.setCurrentType(type, iconData);
        }

        if (!this.currentType) {
            console.error('Current type for situation point is not set.');
            return;
        }

        console.log('Adding situation point:', { point, id, type: this.currentType, iconData });
        this.drawSituationPoint(point, id, this.currentType, iconData || this.iconData);
    }

    drawSituationPoint(point, id, type, iconData) {
        this.currentType = type;
        const situationPointID = id || this.generateSituationPointID();
        const icon = iconData || this.iconData;

        console.log('Drawing situation point:', { point, id: situationPointID, type, iconData });

        const existingSituationPoint = this.situationPoints.find(sp => sp.id === situationPointID);

        if (existingSituationPoint) {
            existingSituationPoint.point.position = point;
        } else {
            const raster = new paper.Raster({
                source: 'data:image/svg+xml;base64,' + btoa(icon),
                position: point,
                scaling: 1.0,
                onLoad: function() {
                    this.position = point;
                }
            });

            this.situationPoints.push({ id: situationPointID, type: this.currentType, x: point.x, y: point.y, point: raster });
        }
        paper.view.update();
    }

    getSituationPoints() {
        return this.situationPoints;
    }

    getLastSituationPoint() {
        return this.situationPoints.length > 0 ? this.situationPoints[this.situationPoints.length - 1] : null;
    }

    activate(type, iconData) {
        this.isActive = true;
        this.setCurrentType(type, iconData);
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
        const headers = ['ID', 'Type', 'X', 'Y', 'Actions'];
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

            const actionsCell = document.createElement('td');
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => {
                this.removeSituationPoint(point.id);
                row.remove();
            });
            actionsCell.appendChild(deleteButton);
            row.appendChild(actionsCell);

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

    removeSituationPoint(id) {
        const index = this.situationPoints.findIndex(point => point.id === id);
        if (index !== -1) {
            this.situationPoints[index].point.remove(); // Remove the point from the canvas
            this.situationPoints.splice(index, 1);
            console.log(`Situation point with ID ${id} removed.`);
        }
    }

    redrawAllSituationPoints() {
        paper.project.clear();
        this.situationPoints.forEach(point => {
            const pointPosition = new paper.Point(point.x, point.y);
            this.drawSituationPoint(pointPosition, point.id, point.type, point.point.source);
        });
    }

    showSituationPoints(pointsList) {
        const table = document.createElement('table');
        table.setAttribute('border', '1');

        const headerRow = document.createElement('tr');
        const headers = ['Type', 'Icon'];
        headers.forEach(headerText => {
            const header = document.createElement('th');
            const textNode = document.createTextNode(headerText);
            header.appendChild(textNode);
            headerRow.appendChild(header);
        });
        table.appendChild(headerRow);

        pointsList.forEach(point => {
            const row = document.createElement('tr');

            const typeCell = document.createElement('td');
            typeCell.textContent = point.type;
            row.appendChild(typeCell);

            const iconCell = document.createElement('td');
            const iconButton = document.createElement('button');
            const iconImg = document.createElement('img');
            iconImg.src = 'data:image/svg+xml;base64,' + btoa(point.icon);
            iconImg.alt = point.type;
            iconButton.appendChild(iconImg);
            iconButton.addEventListener('click', () => {
                this.activate(point.type, point.icon); // Активуємо інструмент з іконкою
            });
            iconCell.appendChild(iconButton);
            row.appendChild(iconCell);

            table.appendChild(row);
        });

        const existingModal = document.getElementById('pointsListModal');
        if (existingModal) {
            document.body.removeChild(existingModal);
        }

        const modal = document.createElement('div');
        modal.id = 'pointsListModal';
        modal.style.cssText = `
            position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%);
            z-index: 100; padding: 20px; background: white; border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1); cursor: move;`;
        modal.appendChild(table);

        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.addEventListener('click', () => document.body.removeChild(modal));
        modal.appendChild(closeButton);

        document.body.appendChild(modal);
        this.makeElementDraggable(modal);
    }

    getIconData(type) {
        const situationPoint = this.situationPoints.find(sp => sp.type === type);
        return situationPoint ? situationPoint.iconData : null;
    }


    makeElementDraggable(el) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        el.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            el.style.top = (el.offsetTop - pos2) + "px";
            el.style.left = (el.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
}
