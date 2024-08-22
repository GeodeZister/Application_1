import ApiService from './my-backend/ApiService.js';

export class ProjectManager {
    constructor(initialData) {
        this.initialData = initialData;
        this.apiService = new ApiService(); // Створюємо екземпляр ApiService
        this.rasterURL = null;
        this.isRasterTransparent = false;
        this.setupListeners();
        this.projectExplorerWindow = null;
        this.selectedProjectId = null;
        this.selectedHouseId = null;
        this.selectedFloorId = null;
    }

    setupListeners() {
        // Лістенер для зміни зображення растра
        const changeRasterImageButton = document.getElementById('changeRasterImageButton');
        if (changeRasterImageButton) {
            changeRasterImageButton.addEventListener('click', () => {
                this.promptForRasterImageUrl();
            });
        } else {
            console.error("Button with id 'changeRasterImageButton' not found.");
        }
        const projectExplorerButton = document.getElementById('projectExplorer');
        if (projectExplorerButton) {
            projectExplorerButton.addEventListener('click', () => {
                this.toggleProjectExplorer();
            });
        } else {
            console.error("Button with id 'projectExplorer' not found.");
        }


        // Лістенер для створення нового проекту
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

    promptForRasterImageUrl() {
        const newImageUrl = prompt("Enter the new raster image URL:");

        if (newImageUrl && newImageUrl.trim()) {
            this.changeRasterImage(newImageUrl.trim());
        } else {
            alert("Please enter a valid URL.");
        }
    }

    async toggleProjectExplorer() {
        if (this.projectExplorerWindow) {
            // Якщо вікно вже відкрите, закриваємо його
            document.body.removeChild(this.projectExplorerWindow);
            this.projectExplorerWindow = null;
        } else {
            // Інакше відкриваємо нове вікно і завантажуємо проекти
            this.projectExplorerWindow = this.createProjectExplorerWindow();
            document.body.appendChild(this.projectExplorerWindow);
            await this.loadProjectsIntoExplorer();
        }
    }

    createProjectExplorerWindow() {
        const windowDiv = document.createElement('div');
        windowDiv.style.cssText = `
            position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%);
            z-index: 100; padding: 20px; background: #f9f9f9; border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1); width: 600px; height: 400px; overflow-y: auto;
            resize: both; overflow: auto; cursor: move;
        `;

        windowDiv.innerHTML = `
            <div id="dragHandle" style="cursor: move; background: #ddd; padding: 5px; text-align: center;">

            </div>
            <h3 style="text-align: center; font-family: Arial, sans-serif; color: #333;">Project Explorer</h3>
            <ul id="projectList" style="list-style-type: none; padding: 0; margin: 0; font-family: Arial, sans-serif; color: #555;"></ul>
            <ul id="houseList" style="list-style-type: none; padding: 0; margin: 0; font-family: Arial, sans-serif; color: #555; display: none;"></ul>
            <ul id="floorList" style="list-style-type: none; padding: 0; margin: 0; font-family: Arial, sans-serif; color: #555; display: none;"></ul>
        `;

        this.makeWindowDraggable(windowDiv);
        return windowDiv;
    }

    async loadProjectsIntoExplorer() {
        const projectList = this.projectExplorerWindow.querySelector('#projectList');
        let selectedItem = null;

        projectList.innerHTML = ''; // Очищаємо список перед оновленням

        try {
            const response = await ApiService.getProjects();
            const projects = response.project;  // Очікуємо, що API повертає { project: [] }

            projects.forEach(project => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <strong>ID:</strong> ${project.project_id} <br>
                    <strong>Name:</strong> ${project.name} <br>
                    <strong>Description:</strong> ${project.description} <br>
                `;
                listItem.style.marginBottom = '10px';
                listItem.style.borderBottom = '1px solid #ccc';
                listItem.style.cursor = 'pointer';

                listItem.addEventListener('click', () => {
                    if (selectedItem) {
                        selectedItem.style.backgroundColor = '';  // Відміняємо підсвічування попереднього вибору
                    }
                    selectedItem = listItem;
                    listItem.style.backgroundColor = '#d3d3d3';  // Підсвічуємо вибраний проект
                    this.selectedProjectId = project.project_id;  // Зберігаємо ID вибраного проекту
                    this.selectedProjectName = project.name;  // Зберігаємо назву вибраного проекту
                });

                projectList.appendChild(listItem);
            });
        } catch (error) {
            console.error('Error loading projects:', error);
            projectList.innerHTML = `<li>Error loading projects</li>`;
        }

        this.addControlButtons();  // Додаємо кнопки керування після завантаження проектів
    }

    makeWindowDraggable(windowDiv) {
        const dragHandle = windowDiv.querySelector('#dragHandle');
        let isDragging = false;
        let startX, startY, initialX, initialY;

        dragHandle.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialX = windowDiv.offsetLeft;
            initialY = windowDiv.offsetTop;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        const onMouseMove = (e) => {
            if (isDragging) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                windowDiv.style.left = `${initialX + dx}px`;
                windowDiv.style.top = `${initialY + dy}px`;
            }
        };

        const onMouseUp = () => {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }


    addControlButtons() {
        const projectList = this.projectExplorerWindow.querySelector('#projectList');
        const houseList = this.projectExplorerWindow.querySelector('#houseList');
        const floorList = this.projectExplorerWindow.querySelector('#floorList');

        // Спочатку видаляємо всі існуючі кнопки
        const existingButtons = this.projectExplorerWindow.querySelectorAll('.control-buttons');
        existingButtons.forEach(button => button.remove());

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'control-buttons';
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'space-between';
        buttonContainer.style.marginTop = '20px';

        const buttonStyle = `
            background-color: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 14px;
            cursor: pointer;
            border-radius: 5px;
            transition: background-color 0.3s;
            margin: 0 5px;
        `;

        const addButton = document.createElement('button');
        addButton.textContent = 'Add';
        addButton.style.cssText = buttonStyle;
        addButton.addEventListener('click', () => {
            if (!this.selectedProjectId) {
                this.showProjectCreationForm(); // Якщо не вибраний проект, створюємо проект
            } else if (this.selectedProjectId && !this.selectedHouseId) {
                this.showBuildingCreationForm(); // Якщо вибраний проект, але не вибрана будівля, створюємо будівлю
            } else if (this.selectedHouseId) {
                this.showFloorCreationForm(); // Якщо вибрана будівля, створюємо поверх
            } else {
                alert('Please select a project or building to add a floor, building, or project.');
            }
        });

        const openButton = document.createElement('button');
        openButton.textContent = 'Open';
        openButton.style.cssText = buttonStyle;
        openButton.addEventListener('click', () => {
            if (this.selectedHouseId) {
                this.loadFloorsForHouse(this.selectedHouseId);
            } else if (this.selectedProjectId) {
                this.loadHousesForProject(this.selectedProjectId);
            }
        });

        const backButton = document.createElement('button');
        backButton.textContent = 'Back';
        backButton.style.cssText = buttonStyle;
        backButton.addEventListener('click', () => {
            if (floorList.style.display === 'block') {
                floorList.style.display = 'none';
                houseList.style.display = 'block';
            } else if (houseList.style.display === 'block') {
                houseList.style.display = 'none';
                projectList.style.display = 'block';
            }
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.style.cssText = buttonStyle;
        deleteButton.addEventListener('click', async () => {
            if (this.selectedFloorId) {
                await ApiService.deleteFloor(this.selectedFloorId);
                this.loadFloorsForHouse(this.selectedHouseId);
            } else if (this.selectedHouseId) {
                await ApiService.deleteHouse(this.selectedHouseId);
                this.loadHousesForProject(this.selectedProjectId);
            } else if (this.selectedProjectId) {
                await ApiService.deleteProject(this.selectedProjectId);
                this.loadProjectsIntoExplorer();
            }
        });

        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.cssText = buttonStyle;
        closeButton.addEventListener('click', () => {
            document.body.removeChild(this.projectExplorerWindow);
            this.projectExplorerWindow = null;
        });

        buttonContainer.appendChild(addButton);
        buttonContainer.appendChild(openButton);
        buttonContainer.appendChild(backButton);
        buttonContainer.appendChild(deleteButton);
        buttonContainer.appendChild(closeButton);

        this.projectExplorerWindow.appendChild(buttonContainer);  // Додаємо кнопки до вікна перегляду
    }

    showFloorCreationForm() {
        if (!this.selectedHouseId) {
            alert('Please select or create a building first.');
            return;
        }

        let existingModal = document.getElementById('floorModal');
        if (existingModal) {
            document.body.removeChild(existingModal);
        }

        const modal = document.createElement('div');
        modal.id = 'floorModal';
        modal.style.cssText = `
            position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%);
            z-index: 100; padding: 20px; background: white; border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1); width: 400px;
        `;
        modal.innerHTML = `
            <h2>Create New Floor</h2>
            <form id="floorForm">
                <div class="form-row" style="margin-bottom: 15px;">
                    <label for="floorNumber">Floor Number:</label>
                    <input type="number" id="floorNumber" name="floorNumber" required>
                </div>
                <div class="form-row" style="margin-bottom: 15px;">
                    <label for="floorDescription">Floor Description:</label>
                    <textarea id="floorDescription" name="floorDescription" required></textarea>
                </div>
                <div class="form-row" style="margin-bottom: 15px;">
                    <label for="rasterUrl">Raster Image URL:</label>
                    <input type="url" id="rasterUrl" name="rasterUrl" required>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <button type="submit" style="
                        background-color: #28a745;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        font-size: 14px;
                        cursor: pointer;
                        border-radius: 5px;
                        transition: background-color 0.3s;
                    ">Create Floor</button>
                    <button type="button" id="closeModal" style="
                        background-color: #dc3545;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        font-size: 14px;
                        cursor: pointer;
                        border-radius: 5px;
                        transition: background-color 0.3s;
                    ">Close</button>
                </div>
            </form>
        `;
        document.body.appendChild(modal);

        const form = modal.querySelector('form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFloorSubmit(form, modal);
        });

        const closeButton = modal.querySelector('#closeModal');
        closeButton.addEventListener('click', () => document.body.removeChild(modal));
    }

    async handleFloorSubmit(form, modal) {
        const floorNumber = form.floorNumber.value.trim();
        const floorDescription = form.floorDescription.value.trim();
        const rasterUrl = form.rasterUrl.value.trim();
        const houseId = this.selectedHouseId;

        if (!floorNumber || !floorDescription || !rasterUrl || !houseId) {
            alert('All fields must be filled. Please enter all required information.');
            return;
        }

        try {
            const floorData = { level: parseInt(floorNumber), description: floorDescription, raster_url: rasterUrl, house_id: houseId };
            const result = await ApiService.addFloor(floorData);

            if (result && result.floor) {
                console.log('Floor created successfully:', result.floor);
                // Додаткові дії після успішного створення поверху, наприклад, оновлення UI
            } else {
                throw new Error('Failed to create floor');
            }

        } catch (error) {
            console.error('Error processing floor creation:', error);
            alert('Error processing floor creation');
        }

        document.body.removeChild(modal);  // Закриваємо модальне вікно після завершення
    }




    changeRasterImage(newImageUrl) {
        this.rasterURL = newImageUrl; // Зберігаємо новий URL
        this.initialData.scaleParameters.setRasterURL(newImageUrl); // Оновлюємо URL в ScaleParameters

        // Завантажити нове зображення
        this.initialData.loadImage(() => {
            this.initialData.redrawAllElements();
            console.log('New raster image loaded successfully.');

            // Оновити таблицю параметрів
            const data = this.initialData.collectParametersData();
            const parametersTable = document.getElementById('parametersTable');
            this.initialData.updateParametersTable(parametersTable, data);
        });
    }

    async loadHousesForProject(projectId) {
        const projectList = this.projectExplorerWindow.querySelector('#projectList');
        const houseList = this.projectExplorerWindow.querySelector('#houseList');
        const buildingView = document.getElementById('building-view'); // Додаємо цю змінну

        projectList.style.display = 'none';  // Приховуємо список проектів
        houseList.style.display = 'block';  // Показуємо список будівель
        let selectedItem = null;

        try {
            const response = await ApiService.getHouses();  // Отримуємо список будівель
            const houses = response.houses.filter(house => house.project_id === projectId);  // Фільтруємо за project_id

            houseList.innerHTML = ''; // Очищаємо список перед показом будівель

            houses.forEach(house => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <strong>House ID:</strong> ${house.house_id} <br>
                    <strong>Name:</strong> ${house.name} <br>
                    <strong>Address:</strong> ${house.adress} <br>
                `;
                listItem.style.marginBottom = '10px';
                listItem.style.borderBottom = '1px solid #ccc';
                listItem.style.cursor = 'pointer';

                listItem.addEventListener('click', () => {
                    if (selectedItem) {
                        selectedItem.style.backgroundColor = '';  // Відміняємо підсвічування попереднього вибору
                    }
                    selectedItem = listItem;
                    listItem.style.backgroundColor = '#d3d3d3';  // Підсвічуємо вибрану будівлю
                    this.selectedHouseId = house.house_id;  // Зберігаємо ID вибраної будівлі
                    this.selectedHouseName = house.name;  // Зберігаємо назву вибраної будівлі

                    // Завантажуємо поверхи будівлі і відображаємо їх у сайдбарі
                    buildingView.innerHTML = ''; // Очищаємо попередній вміст
                    this.updateSidebarWithFloors(house.house_id);
                });

                houseList.appendChild(listItem);
            });

            if (houses.length === 0) {
                houseList.innerHTML = `<li>No houses found for this project</li>`;
            }

            this.addControlButtons();

        } catch (error) {
            console.error('Error loading houses:', error);
            houseList.innerHTML = `<li>Error loading houses</li>`;
        }
    }


    async updateSidebarWithFloors(houseId) {
        try {
            const response = await this.apiService.getFloorsByHouseId(houseId);
            console.log('Received floors:', response.floors);

            if (Array.isArray(response.floors) && response.floors.length > 0) {
                const floors = response.floors;
                const buildingView = document.getElementById('building-view');
                buildingView.innerHTML = ''; // Очищаємо попередній вміст

                // Відображення поверхів
                const buildingDiv = document.createElement('div');
                buildingDiv.classList.add('building');

                floors.forEach(floor => {
                    const floorDiv = document.createElement('div');
                    floorDiv.classList.add('floor');
                    const floorButton = document.createElement('button');
                    floorButton.classList.add('floor-button');
                    floorButton.textContent = `Floor ${floor.level}`;
                    floorDiv.appendChild(floorButton);
                    buildingDiv.appendChild(floorDiv);
                });

                // Додаємо дах
                const roofDiv = document.createElement('div');
                roofDiv.classList.add('roof');
                const roofText = document.createElement('span');
                roofText.classList.add('roof-text');
                roofText.textContent = 'Roof';
                roofDiv.appendChild(roofText);
                buildingDiv.appendChild(roofDiv);

                buildingView.appendChild(buildingDiv);
            } else {
                console.log('No floors found for this house.');
                const buildingView = document.getElementById('building-view');
                buildingView.innerHTML = `<p>No floors available for this building.</p>`;
            }
        } catch (error) {
            console.error('Error fetching floors:', error);

            const buildingView = document.getElementById('building-view');
            buildingView.innerHTML = `<p>Error loading floors. Please try again later.</p>`;
        }
    }

   clearPreviousSelections() {
        const selectedItems = this.projectExplorerWindow.querySelectorAll('li');
        selectedItems.forEach(item => item.style.backgroundColor = '');
   }


    async loadFloorsForHouse(houseId) {
        const houseList = this.projectExplorerWindow.querySelector('#houseList');
        const floorList = this.projectExplorerWindow.querySelector('#floorList');

        houseList.style.display = 'none'; // Приховуємо список будівель
        floorList.style.display = 'block'; // Показуємо список поверхів
        floorList.innerHTML = '';  // Очищуємо попередні дані
        let selectedItem = null;

        try {
            const response = await ApiService.getFloors();
            const floors = response.floors.filter(floor => floor.house_id === houseId);  // Фільтруємо за house_id

            floors.forEach(floor => {
                const listItem = document.createElement('li');
                listItem.style.cssText = `
                    background-color: #fff; padding: 10px; margin-bottom: 10px;
                    border: 1px solid #ddd; border-radius: 5px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                `;
                listItem.innerHTML = `
                    <strong>Floor ID:</strong> ${floor.floor_id} <br>
                    <strong>Level:</strong> ${floor.level} <br>
                    <strong>Description:</strong> ${floor.description} <br>
                `;

                listItem.addEventListener('click', () => {
                    if (selectedItem) {
                        selectedItem.style.backgroundColor = '';  // Відміняємо підсвічування попереднього вибору
                    }
                    selectedItem = listItem;
                    listItem.style.backgroundColor = '#d3d3d3';  // Підсвічуємо вибраний поверх
                    this.selectedFloorId = floor.floor_id;  // Зберігаємо ID вибраного поверху
                });

                floorList.appendChild(listItem);
            });

            if (floors.length === 0) {
                floorList.innerHTML = `<li>No floors found for this house</li>`;
            }

            this.addControlButtons();  // Додаємо кнопки керування після завантаження поверхів

        } catch (error) {
            console.error('Error loading floors:', error);
            floorList.innerHTML = `<li style="color: red;">Error loading floors</li>`;
        }
    }

    clearPreviousSelections() {
        const selectedItems = this.projectExplorerWindow.querySelectorAll('li');
        selectedItems.forEach(item => item.style.backgroundColor = '');
        this.selectedProjectId = null;
        this.selectedHouseId = null;
        this.selectedFloorId = null;  // Очищуємо вибір поверху
    }

    async loadHousesIntoExplorer(projectId) {
        const houseList = this.projectExplorerWindow.querySelector('#houseList');
        houseList.innerHTML = '';  // Очищуємо попередні дані

        try {
            const response = await ApiService.getHouses();
            const houses = response.houses;  // Очікуємо, що API повертає { houses: [] }

            houses.filter(house => house.project_id === projectId).forEach(house => {
                const listItem = document.createElement('li');
                listItem.style.cssText = `
                    background-color: #fff; padding: 10px; margin-bottom: 10px;
                    border: 1px solid #ddd; border-radius: 5px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                `;
                listItem.innerHTML = `
                    <strong>ID:</strong> ${house.house_id} <br>
                    <strong>Name:</strong> ${house.name} <br>
                    <strong>Description:</strong> ${house.description} <br>
                `;
                houseList.appendChild(listItem);
            });
        } catch (error) {
            console.error('Error loading houses:', error);
            houseList.innerHTML = `<li style="color: red;">Error loading houses</li>`;
        }
    }


    showProjectCreationForm() {
        let existingModal = document.getElementById('projectModal');
        if (existingModal) {
            document.body.removeChild(existingModal);
        }

        const modal = document.createElement('div');
        modal.id = 'projectModal';
        modal.style.cssText = `
            position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%);
            z-index: 100; padding: 20px; background: white; border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1); width: 400px;
        `;
        modal.innerHTML = `
            <h2>Create New Project</h2>
            <form id="projectForm">
                <div class="form-row">
                    <label for="projectName">Project Name:</label>
                    <input type="text" id="projectName" name="projectName" required>
                </div>
                <div class="form-row">
                    <label for="description">Project Description:</label>
                    <textarea id="description" name="description" required></textarea>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <button type="submit">Create Project</button>
                    <button type="button" id="closeModal">Close</button>
                </div>
            </form>
        `;
        document.body.appendChild(modal);

        const form = modal.querySelector('form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleProjectSubmit(form, modal);
        });

        const closeButton = modal.querySelector('#closeModal');
        closeButton.addEventListener('click', () => document.body.removeChild(modal));
    }

    async handleProjectSubmit(form, modal) {
        const projectName = form.projectName.value.trim();
        const description = form.description.value.trim();

        if (!projectName || !description) {
            alert('All fields must be filled. Please enter all required information.');
            return;
        }

        try {
            const projectData = { name: projectName, description };
            const result = await ApiService.addProject(projectData);

            if (result && result.project) {
                console.log('Project created successfully:', result.project);
                // Додаткові дії після успішного створення проекту, наприклад, оновлення UI
            } else {
                throw new Error('Failed to create project');
            }

        } catch (error) {
            console.error('Error processing project creation:', error);
            alert('Error processing project creation');
        }

        document.body.removeChild(modal);  // Закриваємо модальне вікно після завершення
    }



    showBuildingCreationForm() {
        if (!this.selectedProjectId) {
            alert('Please select or create a project first.');
            return;
        }

        let existingModal = document.getElementById('buildingModal');
        if (existingModal) {
            document.body.removeChild(existingModal);
        }

        const modal = document.createElement('div');
        modal.id = 'buildingModal';
        modal.style.cssText = `
            position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%);
            z-index: 100; padding: 20px; background: white; border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1); width: 400px;
        `;
        modal.innerHTML = `
            <h2>Create New Building</h2>
            <form id="buildingForm">
                <div class="form-row" style="margin-bottom: 15px;">
                    <label for="buildingName">Building Name:</label>
                    <input type="text" id="buildingName" name="buildingName" required>
                </div>
                <div class="form-row" style="margin-bottom: 15px;">
                    <label for="address">Building Address:</label>
                    <textarea id="address" name="address" required></textarea>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <button type="submit" style="
                        background-color: #28a745;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        font-size: 14px;
                        cursor: pointer;
                        border-radius: 5px;
                        transition: background-color 0.3s;
                    ">Create Building</button>
                    <button type="button" id="closeModal" style="
                        background-color: #dc3545;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        font-size: 14px;
                        cursor: pointer;
                        border-radius: 5px;
                        transition: background-color 0.3s;
                    ">Close</button>
                </div>
            </form>
        `;
        document.body.appendChild(modal);

        const form = modal.querySelector('form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleBuildingSubmit(form, modal);
        });

        const closeButton = modal.querySelector('#closeModal');
        closeButton.addEventListener('click', () => document.body.removeChild(modal));
    }



    async handleBuildingSubmit(form, modal) {
        const buildingName = form.buildingName.value.trim();
        const address = form.address.value.trim();
        const projectId = this.selectedProjectId;

        if (!buildingName || !address || !projectId) {
            alert('All fields must be filled. Please enter all required information.');
            return;
        }

        try {
            const houseData = { name: buildingName, adress: address, project_id: projectId };
            const result = await ApiService.addHouse(houseData);

            if (result && result.house) {
                console.log('Building created successfully:', result.house);
                // Додаткові дії після успішного створення будівлі, наприклад, оновлення UI
            } else {
                throw new Error('Failed to create building');
            }

        } catch (error) {
            console.error('Error processing building creation:', error);
            alert('Error processing building creation');
        }

        document.body.removeChild(modal);  // Закриваємо модальне вікно після завершення
    }

    async loadExistingData() {
        const projectNamesDatalist = document.getElementById('existingProjectNames');
        const buildingIDsDatalist = document.getElementById('existingBuildingIDs');
        const buildingLevelsDatalist = document.getElementById('existingBuildingLevels');
        const rasterURLsDatalist = document.getElementById('existingRasterURLs');

        try {
            const projectsResponse = await ApiService.getProjects();
            const housesResponse = await ApiService.getHouses();
            const floorsResponse = await ApiService.getFloors();
            const imagesResponse = await ApiService.getImages();

            // Очищення списків перед додаванням нових даних
            projectNamesDatalist.innerHTML = '';
            buildingIDsDatalist.innerHTML = '';
            buildingLevelsDatalist.innerHTML = '';
            rasterURLsDatalist.innerHTML = '';

            if (Array.isArray(projectsResponse.project)) {
                projectsResponse.project.forEach(project => {
                    const option = document.createElement('option');
                    option.value = project.name;
                    option.style.color = 'green'; // Підсвічування існуючих проектів зеленим кольором
                    projectNamesDatalist.appendChild(option);
                });
            } else {
                console.error('Expected projects to be an array but received:', projectsResponse);
            }

            if (Array.isArray(housesResponse.houses)) {
                housesResponse.houses.forEach(house => {
                    const option = document.createElement('option');
                    option.value = house.name;
                    buildingIDsDatalist.appendChild(option);
                });
            } else {
                console.error('Expected houses to be an array but received:', housesResponse);
            }

            if (Array.isArray(floorsResponse.floors)) {
                floorsResponse.floors.forEach(floor => {
                    const option = document.createElement('option');
                    option.value = floor.level;
                    buildingLevelsDatalist.appendChild(option);
                });
            } else {
                console.error('Expected floors to be an array but received:', floorsResponse);
            }

            if (Array.isArray(imagesResponse.images)) {
                imagesResponse.images.forEach(image => {
                    const option = document.createElement('option');
                    option.value = image.path;
                    rasterURLsDatalist.appendChild(option);
                });
            } else {
                console.error('Expected images to be an array but received:', imagesResponse);
            }
        } catch (error) {
            console.error('Error loading existing data:', error);
        }
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
                <div class="form-row">
                    <label for="description">Project Description:</label>
                    <textarea id="description" name="description"></textarea>
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
        const description = form.description.value.trim();
        const rasterURL = form.rasterURL.value.trim();

        if (!projectName || !description || !rasterURL) {
            alert('All fields must be filled. Please enter all required information.');
            return;
        }

        try {
            // Перевірка наявності проекту з такою ж назвою
            const existingProjectsResponse = await ApiService.getProjects();
            const existingProjects = existingProjectsResponse.project;
            let projectData = existingProjects.find(proj => proj.name === projectName);

            if (!projectData) {
                // Якщо проект не існує, створюємо новий
                const projectResponse = await ApiService.addProject({ name: projectName, description });
                const jsonResponse = await projectResponse.json(); // Важливо викликати json() лише один раз
                if (projectResponse.ok) {
                    projectData = jsonResponse.project;
                } else {
                    throw new Error('Failed to create project');
                }
            }

            let houseData;
            if (buildingID) {
                const existingHousesResponse = await ApiService.getHouses();
                const existingHouses = existingHousesResponse.houses;
                houseData = existingHouses.find(house => house.name === buildingID && house.project_id === projectData.project_id);

                if (!houseData) {
                    // Якщо будинок не існує, створюємо новий
                    const houseResponse = await ApiService.addHouse({ project_id: projectData.project_id, name: buildingID, adress: description });
                    const houseJsonResponse = await houseResponse.json(); // Викликайте json() лише один раз
                    if (houseResponse.ok) {
                        houseData = houseJsonResponse.house;
                    } else {
                        throw new Error('Failed to create house');
                    }
                }
            }

            if (buildingLevel && houseData) {
                const existingFloorsResponse = await ApiService.getFloors();
                const existingFloors = existingFloorsResponse.floors;
                let floorData = existingFloors.find(floor => floor.level === parseInt(buildingLevel) && floor.house_id === houseData.house_id);

                if (!floorData) {
                    // Якщо поверх не існує, створюємо новий
                    const floorResponse = await ApiService.addFloor({ house_id: houseData.house_id, level: parseInt(buildingLevel), description });
                    if (!floorResponse.ok) {
                        throw new Error('Failed to create floor');
                    }
                }
            }

            alert('Operation completed successfully');
        } catch (error) {
            console.error('Error processing submission:', error);
            alert('Error processing submission');
        }

        document.body.removeChild(modal);  // Закриваємо модальне вікно після завершення
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
                console.log("Global coordinates added:", projectData.globalCoordinates);
            }

            projectData.coordinatesData.forEach(coord => {
                scaleParameters.addCoordinates(coord.inputXY, coord.positionXY);
            });
            console.log("Coordinates data added:", projectData.coordinatesData);

            const originPosition = projectData.originPosition;
            if (originPosition) {
                scaleParameters.setOriginPosition(originPosition.x, originPosition.y);
                this.initialData.coordinateSystem.drawPointOrigin(originPosition.x, originPosition.y);
                console.log("Origin position set and drawn at:", originPosition);
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
                    const iconResponse = await ApiService.getSituationPoints(); // Отримання списку іконок з бази даних
                    const iconList = iconResponse.pointTypes; // Витягніть масив pointTypes із отриманого об'єкта

                    if (Array.isArray(iconList)) {
                        projectData.situationPoints.forEach(situationPointData => {
                            const point = new paper.Point(situationPointData.x, situationPointData.y);
                            const iconData = iconList.find(icon => icon.type === situationPointData.type)?.icon || this.getDefaultIcon();
                            this.initialData.situationPoint.addSituationPoint(point, situationPointData.id, situationPointData.type, iconData);
                            console.log('SituationPoint added:', situationPointData);
                        });
                    } else {
                        console.error('iconList is not an array:', iconList);
                    }
                } else {
                    console.log('No situation points found in project data.');
                }

                if (projectData.rooms) {
                    projectData.rooms.forEach(roomData => {
                        const vertices = roomData.vertices.map(v => new paper.Point(v[1], v[2]));
                        this.initialData.roomManager.addRoom(vertices, roomData.name, roomData.id);
                        console.log('Room added:', roomData);
                    });
                } else {
                    console.log('No rooms found in project data.');
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

