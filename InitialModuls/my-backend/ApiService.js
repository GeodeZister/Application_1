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

    static async getIconList() {
        return await this.fetchData('http://localhost:3000/getIconList');
    }

    static async getSituationPoints() {
        return await this.fetchData('http://localhost:3000/getSituationPoints');
    }

    static async addProject(projectData) {
        try {
            console.log('Sending project data:', projectData);
            const response = await fetch('http://localhost:3000/addProject', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(projectData)
            });
            const result = await response.text();
            console.log('Server response:', result);
            return response;
        } catch (error) {
            console.error('Error adding project data:', error);
            throw new Error('Error adding project data.');
        }
    }

    static async getProjects() {
        return await this.fetchData('http://localhost:3000/projects');
    }

    static async getHouses() {
        return await this.fetchData('http://localhost:3000/houses');
    }

    static async getFloors() {
        return await this.fetchData('http://localhost:3000/floors');
    }

    static async getImages() {
        return await this.fetchData('http://localhost:3000/images');
    }

    static async getFloorsByHouseId(houseId) {
        return await this.fetchData(`http://localhost:3000/floors/${houseId}`);
    }
}

export default ApiService;
