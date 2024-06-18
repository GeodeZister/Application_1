import { ScalingTool } from './ScalingTool.js';
import { RulerTool } from './RulerTool.js';
import { ScaleParameters } from './ScaleParameters.js';
import { CoordinateSystem } from './CoordinateSystem.js';
import { ProjectManager } from './ProjectManager.js';
import { Drawing } from './Drawing.js';
import { ExportData } from './ExportData.js';
import { WayPoint } from './WayPoint.js';
import { AngleDetection } from './AngleDetection.js';
import { SituationPoint } from './SituationPoint.js';
import { RoomManager } from './RoomManager.js';

export class InitialData {
    static instance = null;

    constructor(imageCanvasId, secondCanvasId) {
        if (InitialData.instance) {
            return InitialData.instance;
        }
        InitialData.instance = this;

        this.imageCanvas = document.getElementById(imageCanvasId);
        this.secondCanvas = document.getElementById(secondCanvasId);

        if (!this.imageCanvas || !this.secondCanvas) {
            console.error('One or both canvas IDs provided do not exist on the document.');
            return;
        }

        this.imageCtx = this.imageCanvas.getContext('2d');
        this.secondCtx = this.secondCanvas.getContext('2d');

        this.scaleParameters = new ScaleParameters();
        this.projectManager = new ProjectManager(this);

        this.drawing = new Drawing(this.imageCanvas, this.scaleParameters.getBoundingBoxParameters());
        this.situationPoint = new SituationPoint(imageCanvasId, this.scaleParameters);
        this.roomManager = new RoomManager(imageCanvasId, this.scaleParameters);

        this.scalingTool = new ScalingTool(this.imageCanvas, this.log.bind(this), this.scaleParameters, this.redrawImage.bind(this));
        this.rulerTool = new RulerTool(this.imageCanvas, this.log.bind(this));
        this.coordinateSystem = new CoordinateSystem(this.imageCanvas, this.log.bind(this), this.scaleParameters);
        this.wayPoint = new WayPoint(imageCanvasId, this.scaleParameters);
        this.exportData = new ExportData(imageCanvasId, this.scaleParameters, this.wayPoint, this.drawing, this.situationPoint, this.roomManager);
        this.angleDetection = new AngleDetection(imageCanvasId, this.scaleParameters);

        this.deleteTool = null;

        this.setupListeners();
        this.currentTool = null;
        this.boundingBox = { x: 0, y: 0, width: 0, height: 0, isVisible: false };
        this.scale = 1;
        this.scaleIncrement = 0.1;

        this.log = this.log.bind(this);
        this.redrawImage = this.redrawImage.bind(this);

        this.points = [];
    }

    setupListeners() {
        document.getElementById('loadImageButton').addEventListener('click', () => this.loadImage());

        document.getElementById('drawWallButton').addEventListener('click', () => {
            this.activateTool(this.drawing, this.drawing.activateWall, "Wall drawing tool activated.");
        });

        document.getElementById('addWayPointButton').addEventListener('click', () => {
            if (this.currentTool === this.wayPoint) {
                this.deactivateTool();
                this.log("Way Point tool deactivated.");
            } else {
                this.activateTool(this.wayPoint, this.wayPoint.activate, "Way Point tool activated.");
            }
        });

        document.getElementById('toggleRoomsButton').addEventListener('click', () => {
            this.roomManager.toggleRoomsVisibility();
            this.log(`Rooms ${this.roomManager.rooms[0].visible ? 'shown' : 'hidden'}.`);
        });

        document.getElementById('viewWayPointsButton').addEventListener('click', () => this.createWayPointsTable());

        document.getElementById('drawLineButton').addEventListener('click', () => {
            this.activateTool(this.drawing, this.drawing.activate, "Drawing tool activated.");
        });

        document.getElementById('lineColor').addEventListener('change', (event) => {
            this.drawing.setLineColor(event.target.value);
        });

        document.getElementById('drawRoomButton').addEventListener('click', () => {
            this.activateTool(this.roomManager, this.roomManager.activate, "Room drawing tool activated.");
        });

        document.getElementById('viewRoomsButton').addEventListener('click', () => {
            this.roomManager.createRoomsTable();
        });

        document.getElementById('lineWidth').addEventListener('change', (event) => {
            this.drawing.setLineWidth(parseInt(event.target.value, 10));
        });

        document.getElementById('elevatorButton').addEventListener('click', () => {
            if (this.currentTool === this.situationPoint && this.situationPoint.isActive && this.situationPoint.currentType === 'elevator') {
                this.deactivateTool();
                this.log("Elevator tool deactivated.");
            } else {
                this.situationPoint.activate('elevator');
                this.activateTool(this.situationPoint, null, "Elevator tool activated.");
            }
        });

        document.getElementById('stairsButton').addEventListener('click', () => {
            if (this.currentTool === this.situationPoint && this.situationPoint.isActive && this.situationPoint.currentType === 'stairs') {
                this.deactivateTool();
                this.log("Stairs tool deactivated.");
            } else {
                this.situationPoint.activate('stairs');
                this.activateTool(this.situationPoint, null, "Stairs tool activated.");
            }
        });

        document.getElementById('fireExtinguisherButton').addEventListener('click', () => {
            if (this.currentTool === this.situationPoint && this.situationPoint.isActive && this.situationPoint.currentType === 'fireExtinguisher') {
                this.deactivateTool();
                this.log("Fire Extinguisher tool deactivated.");
            } else {
                this.situationPoint.activate('fireExtinguisher');
                this.activateTool(this.situationPoint, null, "Fire Extinguisher tool activated.");
            }
        });

        document.getElementById('waterCoolerButton').addEventListener('click', () => {
            if (this.currentTool === this.situationPoint && this.situationPoint.isActive && this.situationPoint.currentType === 'waterCooler') {
                this.deactivateTool();
                this.log("Water Cooler tool deactivated.");
            } else {
                this.situationPoint.activate('waterCooler');
                this.activateTool(this.situationPoint, null, "Water Cooler tool activated.");
            }
        });

        document.getElementById('viewSituationPointsButton').addEventListener('click', () => this.situationPoint.createSituationPointsTable());

        document.getElementById('deleteVertexButton').addEventListener('click', () => {
            if (this.currentTool === this.drawing && this.drawing.isDeleteActive) {
                this.deactivateTool();
                this.log("Delete tool deactivated.");
            } else {
                this.activateTool(this.drawing, this.drawing.activateDelete, "Delete tool activated.");
            }
        });

        document.getElementById('setAngleButton').addEventListener('click', () => {
            this.activateTool(this.angleDetection, this.angleDetection.activate, "Angle detection tool activated.");
        });

        document.addEventListener('mousedown', (event) => {
            if (event.button === 2) {
                this.deactivateTool();
                event.preventDefault();
            }
        });

        document.addEventListener('contextmenu', (event) => event.preventDefault());

        document.getElementById('checkCoordinatesButton').addEventListener('click', () => {
            const button = document.getElementById('checkCoordinatesButton');
            if (!button.classList.contains('active')) {
                button.classList.add('active');
                this.coordinateSystem.activateCheckCoordinates();
            } else {
                button.classList.remove('active');
                this.coordinateSystem.deactivateCheckCoordinates();
            }
        });


        document.getElementById('addCoordinatesButton').addEventListener('click', () => {
            this.activateTool(this.coordinateSystem, this.coordinateSystem.activate, null);
            this.highlightButton('addCoordinatesButton');
        });

        document.getElementById('exportSVGButton').addEventListener('click', () => this.exportData.exportAsJPG());

        document.getElementById('exportJsonButton').addEventListener('click', () => this.exportData.exportAsJson());

        document.getElementById('loadJsonButton').addEventListener('click', () => document.getElementById('jsonFileInput').click());

        document.getElementById('jsonFileInput').addEventListener('change', (event) => this.loadProjectFromFile(event.target.files[0]));

        document.getElementById('toggleWayPointsButton').addEventListener('click', () => {
            this.wayPoint.toggleVisibility();
            this.log(`Way points ${this.wayPoint.isVisible ? 'shown' : 'hidden'}.`);
        });

        document.getElementById('rulerButton').addEventListener('click', () => {
            this.activateTool(this.rulerTool, this.rulerTool.activate, null);
            this.highlightButton('rulerButton');
        });

        document.getElementById('scalingButton').addEventListener('click', () => {
            this.activateTool(this.scalingTool, this.scalingTool.activate, null);
            this.highlightButton('scalingButton');
        });

        this.setupModalListeners();
    }

    activateTool(tool, activateMethod, logMessage) {
        if (this.currentTool && this.currentTool !== tool) {
            this.currentTool.deactivate();
        }
        this.currentTool = tool;
        if (tool && activateMethod) {
            activateMethod.call(tool);
        }
        if (logMessage) {
            this.log(logMessage);
        }
    }

    deactivateTool() {
        if (this.currentTool) {
            this.currentTool.deactivate();
            this.currentTool = null;
        }
    }

    highlightButton(buttonId) {
        document.querySelectorAll('.navbar button').forEach(button => button.classList.remove('active'));
        document.getElementById(buttonId).classList.add('active');
    }

    setupModalListeners() {
        const listParametersButton = document.getElementById('listParametersButton');
        const parametersModal = document.getElementById('parametersModal');
        const parametersTable = document.getElementById('parametersTable');

        listParametersButton.addEventListener('click', () => {
            const data = this.collectParametersData();
            this.updateActiveButton(listParametersButton); // Переконайтеся, що цей метод існує
            parametersModal.style.display = 'block';
            this.updateParametersTable(parametersTable, data);
        });

        document.querySelector('.close').addEventListener('click', () => {
            parametersModal.style.display = 'none';
            listParametersButton.classList.remove('active');
        });

        window.addEventListener('click', (event) => {
            if (event.target === parametersModal) {
                parametersModal.style.display = 'none';
                listParametersButton.classList.remove('active');
            }
        });

    }

    collectParametersData() {
        const data = {
            scale: this.scaleParameters.getScale() || 'N/A',
            measuredPixelDistanceForScaling: this.scaleParameters.getMeasuredPixelDistanceForScaling() || 'N/A',
            realDistance: this.scaleParameters.getRealDistance() || 'N/A',
            scaleRatio: this.scaleParameters.getScaleRatio() || 'N/A',
            coordinatesData: this.scaleParameters.getCoordinates() || [],
            boundingBoxParams: this.scaleParameters.getBoundingBoxParameters() || {},
            projectData: this.scaleParameters.getProjectData() || {},
            directionalAngle: this.scaleParameters.getDirectionalAngle() !== null ? this.scaleParameters.getDirectionalAngle().toFixed(2) : 'N/A'
        };

        console.log('Collected Parameters Data:', data); // Додаємо логування

        return data;
    }

   updateParametersTable(parametersTable, data) {
        console.log('Updating Parameters Table with:', data); // Додаємо логування

        const rows = [];
        rows.push(`<tr><th>Scale</th><td>${data.scale}</td></tr>`);
        rows.push(`<tr><th>Measured Pixel Distance for Scaling</th><td>${data.measuredPixelDistanceForScaling}</td></tr>`);
        rows.push(`<tr><th>Real Distance</th><td>${data.realDistance}</td></tr>`);
        rows.push(`<tr><th>Scale Ratio</th><td>${data.scaleRatio}</td></tr>`);
        rows.push(`<tr><th>Directional Angle</th><td>${data.directionalAngle !== 'N/A' ? `${data.directionalAngle}°` : 'N/A'}</td></tr>`);

        data.coordinatesData.forEach((coord, index) => {
            rows.push(`<tr><th>Coord ${index + 1} Input</th><td>(${coord.inputXY.x}, ${coord.inputXY.y})</td></tr>`);
            rows.push(`<tr><th>Coord ${index + 1} Position</th><td>(${coord.positionXY.x}, ${coord.positionXY.y})</td></tr>`);
        });

        if (data.projectData) {
            rows.push(`<tr><th>Project Name</th><td>${data.projectData.projectName || 'N/A'}</td></tr>`);
            rows.push(`<tr><th>Building ID</th><td>${data.projectData.buildingID || 'N/A'}</td></tr>`);
            rows.push(`<tr><th>Building Level</th><td>${data.projectData.buildingLevel || 'N/A'}</td></tr>`);
            rows.push(`<tr><th>Raster URL</th><td>${data.projectData.rasterURL || 'N/A'}</td></tr>`);
        }

        if (data.boundingBoxParams) {
            rows.push(`<tr><th>Bounding Box Width</th><td>${data.boundingBoxParams.width || 'N/A'}</td></tr>`);
            rows.push(`<tr><th>Bounding Box Height</th><td>${data.boundingBoxParams.height || 'N/A'}</td></tr>`);
        }

        parametersTable.innerHTML = rows.join('');
    }

    updateActiveButton(button) {
        document.querySelectorAll('.navbar button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    }


    loadProjectFromFile(file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const projectData = JSON.parse(event.target.result);
            this.projectManager.loadProject(projectData);
        };
        reader.readAsText(file);
    }

    handleZoom(event) {
        event.preventDefault();
        const delta = Math.sign(event.deltaY);
        let scaleChange = delta * this.scaleIncrement;
        this.visualScale = Math.max(0.1, Math.min(this.visualScale - scaleChange, 10));

        this.redrawImage();
    }

    loadImage(callback) {
        const imageUrl = this.projectManager.getImageUrl();
        if (!imageUrl) {
            console.log("No image URL found via ProjectManager.");
            return;
        }

        const image = new Image();
        image.onload = () => {
            let height = this.secondCanvas.parentNode.offsetHeight;
            let width = image.width * (height / image.height);
            if (width > this.secondCanvas.parentNode.offsetWidth) {
                width = this.secondCanvas.parentNode.offsetWidth;
                height = image.height * (width / image.width);
            }

            this.secondCanvas.width = width;
            this.secondCanvas.height = height;
            this.imageCanvas.width = width;
            this.imageCanvas.height = height;
            this.imageCanvas.style.width = `${width}px`;
            this.imageCanvas.style.height = `${height}px`;
            this.secondCanvas.style.width = `${width}px`;
            this.secondCanvas.style.height = `${height}px`;

            this.secondCtx.drawImage(image, 0, 0, width, height);

            this.scaleParameters.setBoundingBoxParameters({ x: 0, y: 0, width, height });
            this.boundingBox.width = width;
            this.boundingBox.height = height;
            this.boundingBox.isVisible = true;

            this.drawBoundingBoxOnSecondCanvas();
            this.drawing = new Drawing('imageCanvas', this.scaleParameters.getBoundingBoxParameters());
            this.redrawAllElements();

            if (callback) callback();
        };

        image.onerror = () => {
            console.error("Failed to load image from URL: " + imageUrl);
        };
        image.src = imageUrl;
    }

    drawBoundingBoxOnSecondCanvas() {
        if (!this.boundingBox.isVisible) return;

        this.secondCtx.strokeStyle = 'blue';
        this.secondCtx.lineWidth = 2;
        this.secondCtx.strokeRect(0, 0, this.boundingBox.width, this.boundingBox.height);
    }

    createWayPointsTable() {
        const wayPoints = this.wayPoint.getWayPoints();
        const table = document.createElement('table');
        table.setAttribute('border', '1');

        const headerRow = document.createElement('tr');
        const headers = ['ID', 'X', 'Y', 'Neighbor 1 ID', 'Neighbor 2 ID'];
        headers.forEach(headerText => {
            const header = document.createElement('th');
            const textNode = document.createTextNode(headerText);
            header.appendChild(textNode);
            headerRow.appendChild(header);
        });
        table.appendChild(headerRow);

        wayPoints.forEach(wayPoint => {
            const row = document.createElement('tr');

            const idCell = document.createElement('td');
            idCell.textContent = wayPoint.id;
            row.appendChild(idCell);

            const xCell = document.createElement('td');
            xCell.textContent = wayPoint.x.toFixed(2);
            row.appendChild(xCell);

            const yCell = document.createElement('td');
            yCell.textContent = wayPoint.y.toFixed(2);
            row.appendChild(yCell);

            const neighbors = this.wayPoint.findNearestNeighbors(wayPoint);
            neighbors.forEach((neighbor, index) => {
                const neighborIdCell = document.createElement('td');
                neighborIdCell.textContent = neighbor.id;
                row.appendChild(neighborIdCell);
            });

            for (let i = neighbors.length; i < 2; i++) {
                const emptyIdCell = document.createElement('td');
                row.appendChild(emptyIdCell);
            }

            table.appendChild(row);
        });

        const existingModal = document.getElementById('wayPointsModal');
        if (existingModal) {
            document.body.removeChild(existingModal);
        }

        const modal = document.createElement('div');
        modal.id = 'wayPointsModal';
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
    redrawAllElements() {
        this.wayPoint.getWayPoints().forEach(wayPoint => {
            this.wayPoint.drawWayPoint(new paper.Point(wayPoint.x, wayPoint.y), wayPoint.id);
        });

        this.situationPoint.getSituationPoints().forEach(situationPoint => {
            this.situationPoint.drawSituationPoint(new paper.Point(situationPoint.x, situationPoint.y), situationPoint.id, situationPoint.type);
        });

        this.roomManager.getRooms().forEach(room => {
            const vertices = room.vertices.map(v => new paper.Point(v.x, v.y));
            this.roomManager.addRoom(vertices, room.name, room.id);
        });
    }



    redrawImage() {
        if (!this.imageCtx) {
            console.error("Image context is not defined.");
            return;
        }
        this.imageCtx.clearRect(0, 0, this.secondCanvas.width, this.secondCanvas.height);
        this.loadImage();
        if (this.boundingBox.isVisible) {
            this.imageCtx.strokeStyle = 'black';
            this.imageCtx.lineWidth = 2;
            this.imageCtx.strokeRect(0, 0, this.boundingBox.width, this.boundingBox.height);
        }
    }

    log(message) {
        console.log(message);
        const logWindow = document.getElementById("logWindow");
        if (logWindow) {
            const messageElement = document.createElement("p");
            messageElement.textContent = message;
            logWindow.appendChild(messageElement);
            logWindow.scrollTop = logWindow.scrollHeight;
        }
    }
}
