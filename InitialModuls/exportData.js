// ExportData.js
export class ExportData {
    constructor(canvasId, scaleParameters, wayPoint, drawing) {
        this.canvas = document.getElementById(canvasId);
        this.scaleParameters = scaleParameters;
        this.wayPoint = wayPoint;
        this.drawing = drawing; // Ensure drawing is properly assigned
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

    exportAsJson() {
        const projectData = this.scaleParameters.getProjectData();
        const boundingBoxParams = this.scaleParameters.getBoundingBoxParameters();
        const coordinatesData = this.scaleParameters.getCoordinates();
        const wayPoints = this.wayPoint.getWayPoints();

        const exportData = {
            projectData,
            boundingBoxParams,
            coordinatesData,
            wayPoints,
            originPosition: this.scaleParameters.getOriginPosition(),
            scale: this.scaleParameters.getScale(),
            measuredPixelDistanceForScaling: this.scaleParameters.getMeasuredPixelDistanceForScaling(),
            realDistance: this.scaleParameters.getRealDistance(),
            scaleRatio: this.scaleParameters.getScaleRatio(),
            directionalAngle: this.scaleParameters.getDirectionalAngle()
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = 'project_data.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    loadProject(projectData) {
        if (this.scaleParameters) {
            const scaleParameters = this.scaleParameters;

            scaleParameters.setProjectData(projectData.projectData);
            scaleParameters.setBoundingBoxParameters(projectData.boundingBoxParams);
            scaleParameters.setScale(projectData.scale || 1);
            scaleParameters.setMeasuredPixelDistanceForScaling(projectData.measuredPixelDistanceForScaling);
            scaleParameters.setRealDistance(projectData.realDistance);
            scaleParameters.setScaleRatio(projectData.scaleRatio);
            scaleParameters.setDirectionalAngle(projectData.directionalAngle);

            projectData.coordinatesData.forEach(coord => {
                scaleParameters.addCoordinates(coord.inputXY, coord.positionXY);
            });

            const originPosition = projectData.originPosition;
            if (originPosition) {
                scaleParameters.setOriginPosition(originPosition.x, originPosition.y);
                this.initialData.coordinateSystem.drawPointOrigin(originPosition.x, originPosition.y);
            }

            this.initialData.loadImage(() => {
                this.initialData.redrawAllElements();

                // Load waypoints after the image is loaded and elements are redrawn
                projectData.wayPoints.forEach(wayPointData => {
                    const point = new paper.Point(wayPointData.x, wayPointData.y);
                    this.initialData.wayPoint.addWayPoint(point, wayPointData.id);
                });

                console.log('Project loaded successfully from file:', projectData);
            });
        } else {
            console.error('ScaleParameters is not available in initialData.');
        }
    }

    getImageUrl() {
        return this.rasterURL;
    }
}
