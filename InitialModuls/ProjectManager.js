export class ProjectManager {
    constructor(initialData) {
        this.initialData = initialData;
        this.rasterURL = null;
        this.setupListeners();
    }

    setupListeners() {
        const newProjectButton = document.getElementById('newProjectButton');
        if (newProjectButton) {
            newProjectButton.addEventListener('click', () => this.showProjectCreationForm());
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

        this.rasterURL = rasterURL;

        const projectData = { projectName, buildingID, buildingLevel, rasterURL };
        this.createProject(projectData);
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

    loadProject(projectData) {
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
                    });
                }

                if (projectData.rooms) {
                    projectData.rooms.forEach(roomData => {
                        // Переконайтеся, що координати мають правильний формат
                        const vertices = roomData.vertices.map(v => new paper.Point(v[1], v[2]));
                        this.initialData.roomManager.addRoom(vertices, roomData.name, roomData.id);
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


    getImageUrl() {
        return this.rasterURL;
    }
}