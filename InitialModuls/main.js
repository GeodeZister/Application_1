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

    openBtn.addEventListener('click', async () => {
        sidebar.style.width = '250px';
        const scaleParameters = initialData.scaleParameters;
        const buildingId = scaleParameters.getBuildingID();
        if (buildingId) {
            const floors = await ApiService.getFloorsByHouseId(buildingId);
            console.log('Floors:', floors);
            const buildingView = document.getElementById('building-view');
            buildingView.innerHTML = ''; // Очищаємо попередній вміст
            floors.forEach(floor => {
                const floorElement = document.createElement('div');
                floorElement.textContent = `Floor ID: ${floor.floor_id}, Level: ${floor.level}`;
                buildingView.appendChild(floorElement);
            });
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
