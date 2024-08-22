//import { Graph } from './Graph.js';

export class ExportData {
    constructor(canvasId, scaleParameters, wayPoint, drawing, situationPoint, roomManager) {
        this.canvas = document.getElementById(canvasId);
        this.scaleParameters = scaleParameters;
        this.wayPoint = wayPoint;
        this.drawing = drawing;
        this.situationPoint = situationPoint;
        this.roomManager = roomManager;
        //this.graph = new Graph();
        if (!this.canvas) {
            console.error(`Canvas with id '${canvasId}' not found.`);
            return;
        }
        this.paperScope = paper.setup(this.canvas);
    }

    exportAsJPG() {
        if (!this.paperScope) {
            console.error('Paper.js scope is not set up correctly.');
            return;
        }

        const { width, height } = this.scaleParameters.getBoundingBoxParameters();
        if (!width || !height) {
            console.error('Invalid bounding box dimensions');
            return;
        }

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

        // Traverse all Paper.js items and convert them to SVG elements
        this.paperScope.project.activeLayer.children.forEach(item => {
            const svgElement = item.exportSVG({ asString: false });
            svg.appendChild(svgElement);
        });

        // Convert the SVG element to a string
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        const img = new Image();
        img.onload = () => {
            // Fill the canvas background with white
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Center the SVG image on the canvas
            const xOffset = (canvas.width - img.width) / 2;
            const yOffset = (canvas.height - img.height) / 2;
            ctx.drawImage(img, xOffset, yOffset);

            // Convert the canvas to a JPG file
            canvas.toBlob((blob) => {
                const jpgUrl = URL.createObjectURL(blob);

                // Get project data for filename
                const projectData = this.scaleParameters.getProjectData();
                const buildingID = projectData.buildingID || 'unknown';
                const buildingLevel = projectData.buildingLevel || 'unknown';
                const fileName = `raster${buildingID}${buildingLevel}.jpg`;

                // Create a download link for JPG
                const downloadLink = document.createElement('a');
                downloadLink.href = jpgUrl;
                downloadLink.download = fileName;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);

                // Revoke the URL after download
                URL.revokeObjectURL(jpgUrl);
            }, 'image/jpeg', 1.0);
        };
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
    }

    //collectGraphData() {
    //    const wayPoints = this.wayPoint.getWayPoints();
    //    const situationPoints = this.situationPoint.getSituationPoints();
    //    this.graph.collectPoints(wayPoints, situationPoints);
    //}

    async exportAsJson() {
        const projectData = this.scaleParameters.getProjectData();
        const boundingBoxParams = this.scaleParameters.getBoundingBoxParameters();
        const coordinatesData = this.scaleParameters.getCoordinates();
        const wayPoints = this.wayPoint.getWayPoints();
        const situationPoints = this.situationPoint.getSituationPoints();
        const rooms = this.roomManager.getRooms();

        // Якщо scaling_id не задано, встановлюємо за замовчуванням "1"
        const scalingId = this.scaleParameters.getScaleId() || "1";

        // Якщо опис не задано, встановлюємо за замовчуванням "None"
        const description = projectData.projectDescription || "None";

        const exportData = {
            projectData,
            boundingBoxParams,
            coordinatesData,
            wayPoints,
            situationPoints,
            rooms,
            originPosition: this.scaleParameters.getOriginPosition(),
            scale: this.scaleParameters.getScale(),
            measuredPixelDistanceForScaling: this.scaleParameters.getMeasuredPixelDistanceForScaling(),
            realDistance: this.scaleParameters.getRealDistance(),
            scaleRatio: this.scaleParameters.getScaleRatio(),
            directionalAngle: this.scaleParameters.getDirectionalAngle(),
            globalCoordinates: this.scaleParameters.getGlobalCoordinates(),
            scaling_id: scalingId,  // Передаємо scaling_id з перевіркою
            description: description  // Передаємо опис з перевіркою
        };

        try {
            const response = await fetch('http://localhost:3000/save-json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ projectData, jsonData: exportData })
            });

            if (response.ok) {
                const result = await response.json();
                console.log(result.message);
            } else {
                console.error('Failed to save JSON file on the server.');
            }
        } catch (error) {
            console.error('Error during export as JSON:', error);
        }
    }

    loadProject(projectData) {
        if (this.initialData && this.initialData.scaleParameters) {
            const scaleParameters = this.initialData.scaleParameters;

            scaleParameters.setProjectData(projectData.projectData);
            scaleParameters.setBoundingBoxParameters(projectData.boundingBoxParams);

            // Завантажуємо параметри
            if (projectData.scale) {
                scaleParameters.setScale(projectData.scale);
            }
            if (projectData.measuredPixelDistanceForScaling) {
                scaleParameters.setMeasuredPixelDistanceForScaling(projectData.measuredPixelDistanceForScaling);
            }
            if (projectData.realDistance) {
                scaleParameters.setRealDistance(projectData.realDistance);
            }
            if (projectData.scaleRatio) {
                scaleParameters.setScaleRatio(projectData.scaleRatio);
            }
            if (projectData.directionalAngle) {
                scaleParameters.setDirectionalAngle(projectData.directionalAngle);
            }

            projectData.coordinatesData.forEach(coord => {
                scaleParameters.addCoordinates(coord.inputXY, coord.positionXY);
            });

            if (projectData.globalCoordinates) {
                projectData.globalCoordinates.forEach(coord => {
                    scaleParameters.addGlobalCoordinates(coord);
                });
            }

            const originPosition = projectData.originPosition;
            if (originPosition) {
                scaleParameters.setOriginPosition(originPosition.x, originPosition.y);
                this.initialData.coordinateSystem.drawPointOrigin(originPosition.x, originPosition.y);
            }

            this.rasterURL = projectData.projectData.rasterURL;
            this.initialData.loadImage(() => {
                this.initialData.redrawAllElements();

                projectData.wayPoints.forEach(wayPointData => {
                    const point = new paper.Point(wayPointData.x, wayPointData.y);
                    this.initialData.wayPoint.addWayPoint(point, wayPointData.id);
                });

                if (projectData.situationPoints) {
                    projectData.situationPoints.forEach(situationPointData => {
                        const point = new paper.Point(situationPointData.x, situationPointData.y);
                        this.initialData.situationPoint.addSituationPoint(point, situationPointData.id, situationPointData.type);
                        console.log(`Loaded situation point: ${JSON.stringify(situationPointData)}`);
                    });
                }

                if (projectData.rooms) {
                    projectData.rooms.forEach(roomData => {
                        const vertices = roomData.vertices.map(v => new paper.Point(v.x, v.y));
                        this.initialData.roomManager.addRoom(vertices, roomData.name, roomData.id);
                        console.log(`Loaded room: ${JSON.stringify(roomData)}`);
                    });
                }

                console.log('Project loaded successfully from file:', projectData);
            });
        } else {
            console.error('ScaleParameters is not available in initialData.');
        }
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

    getImageUrl() {
        return this.rasterURL;
    }
}
