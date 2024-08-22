const fs = require('fs');
const path = require('path');

function saveJsonFile(projectData, jsonData) {
    // Створення структури папок
    const rootDir = path.join(__dirname, 'Json Saves');
    if (!fs.existsSync(rootDir)) {
        fs.mkdirSync(rootDir);
    }

    const projectDir = path.join(rootDir, projectData.projectName || 'unknown_project');
    if (!fs.existsSync(projectDir)) {
        fs.mkdirSync(projectDir);
    }

    const buildingDir = path.join(projectDir, projectData.buildingID || 'unknown_building');
    if (!fs.existsSync(buildingDir)) {
        fs.mkdirSync(buildingDir);
    }

    // Формування імені файлу
    const fileName = `${projectData.projectName || 'proj'}_${projectData.buildingID || 'building'}_${projectData.buildingLevel || 'level'}.json`;
    const filePath = path.join(buildingDir, fileName);

    // Збереження файлу
    fs.writeFileSync(filePath, jsonData, 'utf8');
    console.log(`File saved as: ${filePath}`);

    return filePath; // Повертаємо шлях до файлу для подальшого використання
}

module.exports = saveJsonFile;
