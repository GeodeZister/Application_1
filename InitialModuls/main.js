import { InitialData } from './InitialData.js';
import { ProjectManager } from './ProjectManager.js';
import ApiService from './my-backend/ApiService.js';

document.addEventListener('DOMContentLoaded', () => {
    const initialData = new InitialData('imageCanvas', 'secondCanvas');
    const projectManager = new ProjectManager(initialData);
    initialData.projectManager = projectManager;
    console.log('InitialData:', initialData);  // Логування об'єкта initialData
    console.log('ProjectManager:', projectManager);

    const openBtn = document.getElementById('openSidebar');
    const closeBtn = document.getElementById('closeSidebar');
    const sidebar = document.getElementById('sidebar');
    const buildingView = document.getElementById('building-view'); // Додайте цей елемент у HTML

    openBtn.addEventListener('click', async () => {
        sidebar.style.width = '250px';
        const scaleParameters = initialData.scaleParameters;
        const buildingId = scaleParameters.getBuildingID();
        console.log('Building ID:', buildingId);  // Логування buildingId

        if (buildingId) {
            try {
                const apiService = new ApiService(); // Створення екземпляра ApiService
                const response = await apiService.getFloorsByHouseId(buildingId); // Виклик методу
                console.log('Floors:', response);

                // Перевірка, чи є floors масивом
                if (Array.isArray(response.floors)) {
                    const floors = response.floors;
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
                    console.error('Expected floors to be an array but received:', response);
                }
            } catch (error) {
                console.error('Error fetching floors:', error);
            }
        } else {
            console.log("Building ID is not set in ScaleParameters.");
        }
    });

    closeBtn.addEventListener('click', () => {
        sidebar.style.width = '0';
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const dropdowns = document.querySelectorAll('.dropdown');

    dropdowns.forEach(function(dropdown) {
        const button = dropdown.querySelector('.dropbtn');
        const menu = dropdown.querySelector('.dropdown-content');
        let hideTimeout;

        function showMenu() {
            clearTimeout(hideTimeout);
            menu.style.display = 'block';
            setTimeout(function() {
                menu.style.opacity = 1;
            }, 0);
        }

        function hideMenu() {
            hideTimeout = setTimeout(function() {
                menu.style.opacity = 0;
                setTimeout(function() {
                    menu.style.display = 'none';
                }, 300);
            }, 300);
        }

        button.addEventListener('mouseenter', showMenu);
        button.addEventListener('mouseleave', hideMenu);

        menu.addEventListener('mouseenter', function() {
            clearTimeout(hideTimeout);
            menu.style.display = 'block';
            setTimeout(function() {
                menu.style.opacity = 1;
            }, 0);
        });

        menu.addEventListener('mouseleave', hideMenu);
    });
});
