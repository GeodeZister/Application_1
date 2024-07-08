export class CopyProjectExport {
    constructor(initialData) {
        this.initialData = initialData;
    }

    copyCurrentProject() {
        this.showCopyProjectForm();
    }

    showCopyProjectForm() {
        let existingModal = document.getElementById('copyProjectModal');
        if (existingModal) {
            document.body.removeChild(existingModal);
        }

        const modal = document.createElement('div');
        modal.id = 'copyProjectModal';
        modal.style.cssText = `position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%);
                               z-index: 100; padding: 20px; background: white; border-radius: 10px;
                               box-shadow: 0 4px 8px rgba(0,0,0,0.1);`;
        modal.innerHTML = `
            <h2>Copy Current Project</h2>
            <form id="copyProjectForm">
                <div class="form-row">
                    <label for="newProjectName">New Project Name:</label>
                    <input type="text" id="newProjectName" name="newProjectName">
                </div>
                <div class="form-row">
                    <label for="newBuildingID">New Building ID:</label>
                    <input type="text" id="newBuildingID" name="newBuildingID">
                </div>
                <div class="form-row">
                    <label for="newBuildingLevel">New Building Level:</label>
                    <input type="text" id="newBuildingLevel" name="newBuildingLevel">
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <button type="submit">Create Project</button>
                    <button type="button" id="closeCopyModal">Close</button>
                </div>
            </form>
        `;

        document.body.appendChild(modal);

        const form = modal.querySelector('form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCopyProjectSubmit(form, modal);
        });

        const closeButton = modal.querySelector('#closeCopyModal');
        closeButton.addEventListener('click', () => document.body.removeChild(modal));
    }

    handleCopyProjectSubmit(form, modal) {
        const newProjectName = form.newProjectName.value.trim();
        const newBuildingID = form.newBuildingID.value.trim();
        const newBuildingLevel = form.newBuildingLevel.value.trim();

        if (!newProjectName || !newBuildingID || !newBuildingLevel) {
            alert('All fields must be filled. Please enter all required information.');
            return;  // Keep the modal open for correction
        }

        const newProjectData = { projectName: newProjectName, buildingID: newBuildingID, buildingLevel: newBuildingLevel };

        this.copyProject(newProjectData);

        document.body.removeChild(modal);
    }

    copyProject(newProjectData) {
        const projectData = this.initialData.scaleParameters.getProjectData();
        const newProject = {
            ...projectData,
            projectName: newProjectData.projectName,
            buildingID: newProjectData.buildingID,
            buildingLevel: newProjectData.buildingLevel,
        };

        this.updateWayPoints(newProjectData.buildingID, newProjectData.buildingLevel);
        this.updateSituationPoints(newProjectData.buildingID, newProjectData.buildingLevel);
        this.updateRoomIDs(newProjectData.buildingID, newProjectData.buildingLevel);

        this.initialData.scaleParameters.setProjectData(newProject);
        this.initialData.updateParametersTable(document.getElementById('parametersTable'), this.initialData.collectParametersData());

        alert('Project copied successfully');
    }

    updateWayPoints(newBuildingID, newBuildingLevel) {
        const wayPoints = this.initialData.wayPoint.getWayPoints();
        wayPoints.forEach((wayPoint, index) => {
            const newID = this.generateNewWayPointID(newBuildingID, newBuildingLevel, index + 1);
            wayPoint.id = newID;
        });
    }

    generateNewWayPointID(buildingID, buildingLevel, pointIndex) {
        const formattedBuildingID = buildingID.toString().padStart(3, '0');
        const formattedBuildingLevel = buildingLevel.toString().padStart(2, '0');
        const formattedPointIndex = pointIndex.toString().padStart(3, '0');
        return `${formattedBuildingID}${formattedBuildingLevel}${formattedPointIndex}`;
    }

    updateSituationPoints(newBuildingID, newBuildingLevel) {
        const situationPoints = this.initialData.situationPoint.getSituationPoints();
        situationPoints.forEach((situationPoint, index) => {
            const newID = this.generateNewSituationPointID(newBuildingID, newBuildingLevel, index + 1, situationPoint.type);
            situationPoint.id = newID;

            // Ensure iconData is not lost
            if (!situationPoint.iconData) {
                const iconData = this.initialData.situationPoint.getIconData(situationPoint.type);
                situationPoint.iconData = iconData;
            }
        });
    }

    generateNewSituationPointID(buildingID, buildingLevel, pointIndex, type) {
        const formattedBuildingID = buildingID.toString().padStart(3, '0');
        const formattedBuildingLevel = buildingLevel.toString().padStart(2, '0');
        const formattedPointIndex = pointIndex.toString().padStart(3, '0');
        const typeInitial = type.charAt(0).toUpperCase();
        return `${formattedBuildingID}${formattedBuildingLevel}${formattedPointIndex}${typeInitial}`;
    }

    updateRoomIDs(newBuildingID, newBuildingLevel) {
        const rooms = this.initialData.roomManager.getRooms();
        rooms.forEach((room, index) => {
            const newID = this.generateNewRoomID(newBuildingID, newBuildingLevel, index + 1);
            room.id = newID;
        });
    }

    generateNewRoomID(buildingID, buildingLevel, roomIndex) {
        const formattedBuildingID = buildingID.toString().padStart(3, '0');
        const formattedBuildingLevel = buildingLevel.toString().padStart(2, '0');
        const formattedRoomIndex = roomIndex.toString().padStart(3, '0');
        return `${formattedBuildingID}${formattedBuildingLevel}${formattedRoomIndex}`;
    }
}
