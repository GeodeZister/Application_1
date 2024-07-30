// server.js
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const dbConfig = require('./dbConfig');

const app = express();
const port = 3000;

// Додаємо підтримку CORS
app.use(cors());

// Додаємо обробку JSON
app.use(express.json());

// Створення пулу з'єднань
const pool = mysql.createPool(dbConfig);

// Проміжне ПЗ для обробки з'єднань з БД
app.use(async (req, res, next) => {
    try {
        req.db = await pool.getConnection();
        next();
    } catch (error) {
        console.error('Error getting database connection:', error);
        res.status(500).send('Database connection failed.');
    }
});

// Обробка завершення з'єднань
app.use(async (req, res, next) => {
    if (req.db) {
        try {
            await req.db.release();
        } catch (error) {
            console.error('Error releasing database connection:', error);
        }
    }
    next();
});

// Маршрут для перевірки з'єднання з базою даних
app.get('/checkdb', async (req, res) => {
    try {
        await req.db.ping();
        res.send('Database connection successful.');
    } catch (error) {
        console.error('Error pinging database:', error);
        res.status(500).send('Database connection failed.');
    }
});

app.get('/projects', async (req, res) => {
    try {
        const [rows] = await req.db.execute('SELECT project_id, name FROM project');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).send('Failed to fetch projects.');
    }
});

app.get('/houses', async (req, res) => {
    try {
        const [rows] = await req.db.execute('SELECT house_id, name FROM house');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching houses:', error);
        res.status(500).send('Failed to fetch houses.');
    }
});

app.post('/addProject', async (req, res) => {
    const { projectName, buildingID, buildingLevel, rasterURL } = req.body;
    console.log('Received project data:', req.body);
    // Тимчасово вимикаємо додавання даних у базу даних
    res.status(200).send('Project data received (database insert disabled)');
});

app.get('/floors', async (req, res) => {
    try {
        const [rows] = await req.db.execute('SELECT floor_id, level FROM floor');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching floors:', error);
        res.status(500).send('Failed to fetch floors.');
    }
});

app.get('/images', async (req, res) => {
    try {
        const [rows] = await req.db.execute('SELECT layout_id, path FROM layout');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).send('Failed to fetch images.');
    }
});

// Маршрут для отримання списку ситуаційних точок
app.get('/getSituationPoints', async (req, res) => {
    try {
        const [rows] = await req.db.query('SELECT type, icon FROM point_type');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching situation points:', error);
        res.status(500).send('Failed to fetch situation points.');
    }
});

app.get('/floors/:house_id', async (req, res) => {
    const houseId = req.params.house_id;
    try {
        const [rows] = await req.db.execute('SELECT floor_id, level FROM floor WHERE house_id = ?', [houseId]);
        res.json(rows);
    } catch (error) {
        console.error(`Error fetching floors for house ID ${houseId}:`, error);
        res.status(500).send(`Failed to fetch floors for house ID ${houseId}.`);
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
