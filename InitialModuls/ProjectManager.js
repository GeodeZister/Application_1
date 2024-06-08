export class ProjectManager {
    constructor(initialData) {
        this.initialData = initialData;
        this.rasterURL = null; // Ініціалізуємо властивість для збереження URL
        this.setupListeners();
    }

    setupListeners() {
        document.getElementById('newProjectButton').addEventListener('click', () => this.showProjectCreationForm());
    }

    showProjectCreationForm() {
        let existingModal = document.getElementById('projectModal');
        if (existingModal) {
            document.body.removeChild(existingModal);
        }

        const modal = this.createModal();
        document.body.appendChild(modal);

        const form = modal.querySelector('form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit(form, modal);
        });

        const closeButton = modal.querySelector('#closeModal');
        closeButton.addEventListener('click', () => document.body.removeChild(modal));
    }

    createModal() {
        const modal = document.createElement('div');
        modal.id = 'projectModal';
        modal.style.cssText = `position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%);
                               z-index: 100; padding: 20px; background: white; border-radius: 10px;
                               box-shadow: 0 4px 8px rgba(0,0,0,0.1);`;
        modal.innerHTML = `
            <h2>Create New Project</h2>
            <form id="projectForm">
                <label for="projectName">Project Name:</label>
                <input type="text" id="projectName" name="projectName" required>
                <br><br>
                <label for="buildingID">Building ID:</label>
                <input type="text" id="buildingID" name="buildingID" required>
                <br><br>
                <label for="buildingLevel">Building Level:</label>
                <input type="text" id="buildingLevel" name="buildingLevel" required>
                <br><br>
                <label for="rasterURL">Raster Image URL:</label>
                <input type="url" id="rasterURL" name="rasterURL" required>
                <br><br>
                <button type="submit">Create Project</button>
                <button type="button" id="closeModal">Close</button>
            </form>
        `;
        return modal;
    }

    handleSubmit(form, modal) {
        const projectName = form.projectName.value.trim();
        const buildingID = form.buildingID.value.trim();
        const buildingLevel = form.buildingLevel.value.trim();
        const rasterURL = form.rasterURL.value.trim();

        if (!projectName || !buildingID || !buildingLevel || !rasterURL) {
            alert('All fields must be filled. Please enter all required information.');
            return;  // Keep the modal open for correction
        }

        // Зберігаємо URL у класі ProjectManager
        this.rasterURL = rasterURL;

        const projectData = { projectName, buildingID, buildingLevel, rasterURL };
        this.createProject(projectData);
        document.body.removeChild(modal);  // Remove modal after successful submission
    }

    createProject(projectData) {
        if (this.initialData && this.initialData.scaleParameters) {
            this.initialData.scaleParameters.setProjectData(projectData);
            console.log(`Project created successfully with data:`, projectData);
        } else {
            console.error('ScaleParameters is not available in initialData.');
        }
    }

    loadProjectFromFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const projectData = JSON.parse(e.target.result);
                    this.loadProject(projectData);
                };
                reader.readAsText(file);
            }
        });

        input.click();
    }

    loadProject(projectData) {
        if (this.initialData && this.initialData.scaleParameters) {
            const scaleParameters = this.initialData.scaleParameters;

            scaleParameters.setProjectData(projectData.projectData);
            scaleParameters.setBoundingBoxParameters(projectData.boundingBoxParams);
            scaleParameters.setScaleParameters({
                scale: projectData.scale,
                measuredPixelDistanceForScaling: projectData.measuredPixelDistanceForScaling,
                realDistance: projectData.realDistance,
                scaleRatio: projectData.scaleRatio
            });

            projectData.coordinatesData.forEach(coord => {
                scaleParameters.addCoordinates(coord.inputXY, coord.positionXY);
            });

            const originPosition = projectData.originPosition;
            if (originPosition) {
                scaleParameters.setOriginPosition(originPosition.x, originPosition.y);
                this.initialData.coordinateSystem.drawPointOrigin(originPosition.x, originPosition.y);
            }

            this.rasterURL = projectData.projectData.rasterURL;
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
