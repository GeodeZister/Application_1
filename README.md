# Strong Post Blog

A modern and responsive blog application built with React for the frontend and Node.js/Express for the backend, utilizing MySQL as the database. This application allows users to create, read, update, and delete blog posts with ease.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
  - [1. Start the Backend Server](#1-start-the-backend-server)
  - [2. Start the Frontend Server](#2-start-the-frontend-server)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features

- **CRUD Operations:** Create, read, update, and delete blog posts.
- **Responsive Design:** Optimized for both desktop and mobile devices.
- **Image Uploads:** Users can upload images with their posts.
- **Modern UI:** Clean and intuitive user interface.

## Technologies Used

- **Frontend:**
  - [React](https://reactjs.org/)
  - [Styled-Components](https://styled-components.com/)
  - [Font Awesome](https://fontawesome.com/)
- **Backend:**
  - [Node.js](https://nodejs.org/)
  - [Express](https://expressjs.com/)
  - [MySQL](https://www.mysql.com/)
  - [Sequelize](https://sequelize.org/) (ORM)
- **Other Tools:**
  - [Axios](https://axios-http.com/) for HTTP requests
  - [React Router](https://reactrouter.com/) for routing

## Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js:** Installed on your machine. You can download it from [here](https://nodejs.org/).
- **MySQL:** Installed and running. You can download it from [here](https://www.mysql.com/downloads/).
- **Git:** Installed for version control. Download it from [here](https://git-scm.com/downloads).

## Installation

Follow these steps to set up the project locally.

### 1. Clone the Repository

Open your terminal and run the following command to clone the repository:

```bash
git clone https://github.com/username/strong-post-blog.git

**Navigate to the project directory:**

cd post_blog

**Navigate to the backend directory and install dependencies:**

cd backend
npm install

**Open a new terminal window/tab, navigate to the frontend directory, and install dependencies:**

cd frontend
npm install

**Create a MySQL Database:**

Open your MySQL client (e.g., MySQL Workbench, phpMyAdmin, or command-line) and create a new database:

CREATE DATABASE post_blog;

**Create a .env file in the backend directory and add your MySQL configuration:**

DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=strong_post_blog
DB_DIALECT=mysql

**If you're using Sequelize for ORM, you can run migrations to set up the database schema:**

npx sequelize-cli db:migrate


**Start the Backend Server**
npm start

**In the frontend directory, start the React development server:**
npm start

**This project is licensed under the MIT License.**
