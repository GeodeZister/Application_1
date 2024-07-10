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