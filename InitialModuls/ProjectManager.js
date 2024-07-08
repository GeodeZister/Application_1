import ApiService from './my-backend/ApiService.js';

export class ProjectManager {
    constructor(initialData) {
        this.initialData = initialData;
        this.rasterURL = null;
        this.setupListeners();
    }

    setupListeners() {
        const newProjectButton = document.getElementById('newProjectButton');
        if (newProjectButton) {
            newProjectButton.addEventListener('click', () => {
                this.showProjectCreationForm();
                this.loadExistingData();
            });
        } else {
            console.error("Button with id 'newProjectButton' not found.");
        }
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

    async loadExistingData() {
        const projectNamesSelect = document.getElementById('existingProjectNames');
        const buildingIDsSelect = document.getElementById('existingBuildingIDs');
        const buildingLevelsSelect = document.getElementById('existingBuildingLevels');
        const rasterURLsSelect = document.getElementById('existingRasterURLs');

        const projects = await ApiService.getProjects();
        const houses = await ApiService.getHouses();
        const floors = await ApiService.getFloors();
        const images = await ApiService.getImages();

        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.name;
            option.text = project.name;
            projectNamesSelect.appendChild(option);
        });

        houses.forEach(house => {
            const option = document.createElement('option');
            option.value = house.name;
            option.text = house.name;
            buildingIDsSelect.appendChild(option);
        });

        floors.forEach(floor => {
            const option = document.createElement('option');
            option.value = floor.level;
            option.text = floor.level;
            buildingLevelsSelect.appendChild(option);
        });

        images.forEach(image => {
            const option = document.createElement('option');
            option.value = image.path;
            option.text = image.path;
            rasterURLsSelect.appendChild(option);
        });
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
                <div class="form-row">
                    <label for="projectName">Project Name:</label>
                    <input type="text" id="projectName" name="projectName">
                    <select id="existingProjectNames" name="existingProjectNames" onchange="document.getElementById('projectName').value = this.value;">
                        <option value="">Select existing project</option>
                    </select>
                </div>
                <div class="form-row">
                    <label for="buildingID">Building ID:</label>
                    <input type="text" id="buildingID" name="buildingID">
                    <select id="existingBuildingIDs" name="existingBuildingIDs" onchange="document.getElementById('buildingID').value = this.value;">
                        <option value="">Select existing building</option>
                    </select>
                </div>
                <div class="form-row">
                    <label for="buildingLevel">Building Level:</label>
                    <input type="text" id="buildingLevel" name="buildingLevel">
                    <select id="existingBuildingLevels" name="existingBuildingLevels" onchange="document.getElementById('buildingLevel').value = this.value;">
                        <option value="">Select existing level</option>
                    </select>
                </div>
                <div class="form-row">
                    <label for="rasterURL">Raster Image URL:</label>
                    <input type="url" id="rasterURL" name="rasterURL">
                    <select id="existingRasterURLs" name="existingRasterURLs" onchange="document.getElementById('rasterURL').value = this.value;">
                        <option value="">Select existing URL</option>
                    </select>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <button type="submit">Create Project</button>
                    <button type="button" id="closeModal">Close</button>
                </div>
            </form>
        `;
        return modal;
    }

    async handleSubmit(form, modal) {
        const projectName = form.projectName.value.trim();
        const buildingID = form.buildingID.value.trim();
        const buildingLevel = form.buildingLevel.value.trim();
        const rasterURL = form.rasterURL.value.trim();

        if (!projectName || !buildingID || !buildingLevel || !rasterURL) {
            alert('All fields must be filled. Please enter all required information.');
            return;  // Keep the modal open for correction
        }

        this.rasterURL = rasterURL;

        const projectData = { projectName, buildingID, buildingLevel, rasterURL };
        console.log('Submitting project data:', projectData);

        try {
            const response = await ApiService.addProject(projectData);
            console.log('Server response:', response);
            if (response.ok) {
                alert('Project created successfully');
            } else {
                alert('Failed to create project');
            }
        } catch (error) {
            console.error('Error creating project:', error);
            alert('Error creating project');
        }

        document.body.removeChild(modal);  // Remove modal after successful submission
    }

    createProject(projectData) {
        if (this.initialData && this.initialData.scaleParameters) {
            this.initialData.scaleParameters.setProjectData(projectData);
            console.log('Project created successfully with data:', projectData);
        } else {
            console.error('ScaleParameters is not available in initialData.');
        }
    }

    loadProjectFromFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (file) {
                try {
                    const projectData = await this.readFileAsJson(file);
                    this.loadProject(projectData);
                } catch (error) {
                    console.error('Error loading project from file:', error);
                }
            }
        });

        input.click();
    }

    async readFileAsJson(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(JSON.parse(e.target.result));
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    async loadProject(projectData) {
        if (this.initialData && this.initialData.scaleParameters) {
            const scaleParameters = this.initialData.scaleParameters;

            scaleParameters.setProjectData(projectData.projectData);
            scaleParameters.setBoundingBoxParameters(projectData.boundingBoxParams);

            if (projectData.scale) {
                scaleParameters.setScale(projectData.scale);
                console.log("Scale set to:", projectData.scale);
            }
            if (projectData.measuredPixelDistanceForScaling) {
                scaleParameters.setMeasuredPixelDistanceForScaling(projectData.measuredPixelDistanceForScaling);
                console.log("Measured Pixel Distance for Scaling set to:", projectData.measuredPixelDistanceForScaling);
            }
            if (projectData.realDistance) {
                scaleParameters.setRealDistance(projectData.realDistance);
                console.log("Real Distance set to:", projectData.realDistance);
            }
            if (projectData.scaleRatio) {
                scaleParameters.setScaleRatio(projectData.scaleRatio);
                console.log("Scale Ratio set to:", projectData.scaleRatio);
            }
            if (projectData.directionalAngle) {
                scaleParameters.setDirectionalAngle(projectData.directionalAngle);
                console.log("Directional Angle set to:", projectData.directionalAngle);
            }

            projectData.coordinatesData.forEach(coord => {
                scaleParameters.addCoordinates(coord.inputXY, coord.positionXY);
            });

            const originPosition = projectData.originPosition;
            if (originPosition) {
                scaleParameters.setOriginPosition(originPosition.x, originPosition.y);
                this.initialData.coordinateSystem.drawPointOrigin(originPosition.x, originPosition.y);
            }

            this.rasterURL = projectData.projectData.rasterURL;
            this.initialData.loadImage(async () => {
                this.initialData.redrawAllElements();

                projectData.wayPoints.forEach(wayPointData => {
                    const point = new paper.Point(wayPointData.x, wayPointData.y);
                    this.initialData.wayPoint.addWayPoint(point, wayPointData.id, wayPointData.description);
                    console.log('WayPoint added:', wayPointData);
                });

                if (projectData.situationPoints) {
                    const iconList = await ApiService.getSituationPoints(); // Отримання списку іконок з бази даних

                    projectData.situationPoints.forEach(situationPointData => {
                        const point = new paper.Point(situationPointData.x, situationPointData.y);
                        const iconData = iconList.find(icon => icon.type === situationPointData.type)?.icon || this.getDefaultIcon();
                        this.initialData.situationPoint.addSituationPoint(point, situationPointData.id, situationPointData.type, iconData);
                        console.log('SituationPoint added:', situationPointData);
                    });
                }

                if (projectData.rooms) {
                    projectData.rooms.forEach(roomData => {
                        const vertices = roomData.vertices.map(v => new paper.Point(v[1], v[2]));
                        this.initialData.roomManager.addRoom(vertices, roomData.name, roomData.id);
                        console.log('Room added:', roomData);
                    });
                }

                console.log('Project loaded successfully from file:', projectData);

                // Оновлення таблиці параметрів після завантаження проекту
                const data = this.initialData.collectParametersData();
                const parametersTable = document.getElementById('parametersTable');
                this.initialData.updateParametersTable(parametersTable, data);
            });
        } else {
            console.error('ScaleParameters is not available in initialData.');
        }
    }

    getDefaultIcon() {
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25" width="25" height="25">
                <rect width="25" height="25" fill="red"/>
            </svg>
        `;
        return svg;
    }

    getImageUrl() {
        return this.rasterURL;
    }
}
