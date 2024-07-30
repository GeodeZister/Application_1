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
        const projectNamesDatalist = document.getElementById('existingProjectNames');
        const buildingIDsDatalist = document.getElementById('existingBuildingIDs');
        const buildingLevelsDatalist = document.getElementById('existingBuildingLevels');
        const rasterURLsDatalist = document.getElementById('existingRasterURLs');

        const projects = await ApiService.getProjects();
        const houses = await ApiService.getHouses();
        const floors = await ApiService.getFloors();
        const images = await ApiService.getImages();

        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.name;
            projectNamesDatalist.appendChild(option);
        });

        houses.forEach(house => {
            const option = document.createElement('option');
            option.value = house.name;
            buildingIDsDatalist.appendChild(option);
        });

        floors.forEach(floor => {
            const option = document.createElement('option');
            option.value = floor.level;
            buildingLevelsDatalist.appendChild(option);
        });

        images.forEach(image => {
            const option = document.createElement('option');
            option.value = image.path;
            rasterURLsDatalist.appendChild(option);
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
                    <div class="combined-input">
                        <input type="text" id="projectName" name="projectName" list="existingProjectNames">
                        <datalist id="existingProjectNames"></datalist>
                    </div>
                </div>
                <div class="form-row">
                    <label for="buildingID">Building ID:</label>
                    <div class="combined-input">
                        <input type="text" id="buildingID" name="buildingID" list="existingBuildingIDs">
                        <datalist id="existingBuildingIDs"></datalist>
                    </div>
                </div>
                <div class="form-row">
                    <label for="buildingLevel">Building Level:</label>
                    <div class="combined-input">
                        <input type="text" id="buildingLevel" name="buildingLevel" list="existingBuildingLevels">
                        <datalist id="existingBuildingLevels"></datalist>
                    </div>
                </div>
                <div class="form-row">
                    <label for="rasterURL">Raster Image URL:</label>
                    <div class="combined-input">
                        <input type="url" id="rasterURL" name="rasterURL" list="existingRasterURLs">
                        <datalist id="existingRasterURLs"></datalist>
                    </div>
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

        this.rasterURL = rasterURL;  // Зберігаємо rasterURL
        console.log('Stored rasterURL in handleSubmit:', this.rasterURL);  // Логування збереженого rasterURL
        console.log('This in handleSubmit:', this);  // Логування this у handleSubmit

        const projectData = { projectName, buildingID, buildingLevel, rasterURL };
        console.log('Submitting project data:', projectData);

        try {
            const response = await ApiService.addProject(projectData);
            console.log('Server response:', response);
            if (response.ok) {
                alert('Project created successfully');
                this.createProject(projectData);  // Оновлюємо дані в scaleParameters
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
        console.log('This in createProject:', this);  // Логування this у createProject
        if (this.initialData && this.initialData.scaleParameters) {
            this.initialData.scaleParameters.setProjectData(projectData);
            this.rasterURL = projectData.rasterURL;  // Зберігаємо rasterURL у scaleParameters
            console.log('Project created successfully with data:', projectData);
            console.log('Stored rasterURL in createProject:', this.rasterURL);  // Логування збереженого rasterURL
        } else {
            console.error('ScaleParameters is not available in initialData.');
        }
    }

    getImageUrl() {
        console.log('This in getImageUrl:', this);  // Логування this у getImageUrl
        console.log('Returning rasterURL from getImageUrl:', this.rasterURL);  // Логування поверненого rasterURL
        return this.rasterURL;  // Повертаємо збережене значення rasterURL
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

            if (projectData.globalCoordinates) {
                projectData.globalCoordinates.forEach(coord => {
                    scaleParameters.addGlobalCoordinates(coord);
                });
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


}
