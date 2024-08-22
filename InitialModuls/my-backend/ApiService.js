class ApiService {
    static async fetchData(url, options = {}) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
            throw new Error(`Error fetching data from ${url}`);
        }
    }

    static async checkDatabase() {
        try {
            const response = await fetch('http://localhost:3000/checkdb');
            const message = await response.text();
            return message;
        } catch (error) {
            console.error('Error connecting to the database:', error);
            throw new Error('Error connecting to the database.');
        }
    }

    static async deleteProject(projectId) {
        try {
            const response = await fetch(`http://localhost:3000/deleteProject/${projectId}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error(`Failed to delete project with ID ${projectId}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error deleting project: ${error}`);
            throw error;
        }
    }

    static async importJSON(filePath) {
        try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

            const response = await fetch('http://localhost:3000/insertProjectHierarchy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            console.log('Data imported successfully!', result);
        } catch (error) {
            console.error('Failed to import data:', error);
        }
    }


    static async deleteHouse(houseId) {
        try {
            const response = await fetch(`http://localhost:3000/deleteHouse/${houseId}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error(`Failed to delete house with ID ${houseId}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error deleting house: ${error}`);
            throw error;
        }
    }

    static async deleteFloor(floorId) {
        try {
            const response = await fetch(`http://localhost:3000/deleteFloor/${floorId}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error(`Failed to delete floor with ID ${floorId}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error deleting floor: ${error}`);
            throw error;
        }
    }

    static async getIconList() {
        return await this.fetchData('http://localhost:3000/selectAllPointTypes');
    }

    static async getSituationPoints() {
        return await this.fetchData('http://localhost:3000/selectAllPointTypes');
    }

    static async addProject(projectData) {
        try {
            console.log('Sending project data:', projectData);
            const response = await fetch('http://localhost:3000/insertProject', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(projectData)
            });

            const result = await response.json(); // Використовуємо json(), але лише один раз
            console.log('Server response:', result);
            return result;
        } catch (error) {
            console.error('Error adding project data:', error);
            throw new Error('Error adding project data.');
        }
    }

    static async addHouse(houseData) {
        try {
            console.log('Sending house data:', houseData);
            const response = await fetch('http://localhost:3000/insertHouse', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(houseData)
            });

            const result = await response.json(); // Використовуємо json(), але лише один раз
            console.log('Server response:', result);
            return result;
        } catch (error) {
            console.error('Error adding house data:', error);
            throw new Error('Error adding house data.');
        }
    }


    static async addFloor(floorData) {
        try {
            console.log('Sending floor data:', floorData);
            const response = await fetch('http://localhost:3000/insertFloor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(floorData)
            });

            const result = await response.json(); // Використовуємо json(), але лише один раз
            console.log('Server response:', result);
            return result;
        } catch (error) {
            console.error('Error adding floor data:', error);
            throw new Error('Error adding floor data.');
        }
    }


    static async getProjects() {
        return await this.fetchData('http://localhost:3000/selectAllProjekts');
    }

    static async getHouses() {
        return await this.fetchData('http://localhost:3000/selectAllHouses');
    }

    static async getFloors() {
        return await this.fetchData('http://localhost:3000/selectAllFloors');
    }

    static async getImages() {
        return await this.fetchData('http://localhost:3000/selectAllImages');
    }

    async getFloorsByHouseId(houseId) {
        const url = `http://localhost:3000/selectFloorsByHouseId/${houseId}`;
        return await ApiService.fetchData(url);  // Виклик через ApiService
    }


    static async getLayoutPath(houseID, projectName, floor) {
        return await this.fetchData(`http://localhost:3000/getLayout/${houseID}/${projectName}/${floor}`);
    }
}

export default ApiService;
