import { ScalingTool } from './ScalingTool.js';
import { RulerTool } from './RulerTool.js';
import { ScaleParameters } from './ScaleParameters.js';
import { CoordinateSystem } from './CoordinateSystem.js';
import { ProjectManager } from './ProjectManager.js';
import { Drawing } from './Drawing.js';

export class InitialData {
    static instance = null;

    static getInstance(imageCanvasId, secondCanvasId) {
        if (!InitialData.instance) {
            InitialData.instance = new InitialData(imageCanvasId, secondCanvasId);
        }
        return InitialData.instance;
    }

    constructor(imageCanvasId, secondCanvasId) {
        if (InitialData.instance) {
            throw new Error("Use InitialData.getInstance() instead of new operator.");
        }
        InitialData.instance = this;

        this.imageCanvas = document.getElementById(imageCanvasId);
        this.secondCanvas = document.getElementById(secondCanvasId);

        if (!this.imageCanvas || !this.secondCanvas) {
            console.error('One or both canvas IDs provided do not exist on the document.');
            return;
        }

        this.imageCtx = this.imageCanvas.getContext('2d');
        this.secondCtx = this.secondCanvas.getContext('2d');

        this.scaleParameters = new ScaleParameters(); // Ініціалізація scaleParameters
        this.projectManager = new ProjectManager(this); // Передаємо весь екземпляр InitialData

        this.scalingTool = new ScalingTool(this.imageCanvas, this.log.bind(this), this.scaleParameters, this.redrawImage.bind(this));
        this.rulerTool = new RulerTool(this.imageCanvas, this.log.bind(this));
        this.coordinateSystem = new CoordinateSystem(this.imageCanvas, this.log.bind(this), this.scaleParameters);

        this.drawing = null;
        this.deleteTool = null;

        this.setupListeners();
        this.currentTool = null;
        this.boundingBox = { x: 0, y: 0, width: 0, height: 0, isVisible: false };
        this.scale = 1;
        this.scaleIncrement = 0.1;

        this.log = this.log.bind(this);
        this.redrawImage = this.redrawImage.bind(this);

        this.points = [];
        this.listeners = [];
    }

    setupListeners() {
        const addListener = (elementId, event, handler) => {
            const element = document.getElementById(elementId);
            if (element) {
                element.addEventListener(event, handler);
                this.listeners.push({ element, event, handler });
            } else {
                console.error(`Element with id ${elementId} not found.`);
            }
        };

        addListener('loadImageButton', 'click', () => this.loadImage());
        addListener('drawLineButton', 'click', () => this.activateTool(this.drawing));
        addListener('deleteVertexButton', 'click', () => this.toggleDeleteTool());
        addListener('checkCoordinatesModeCheckbox', 'change', (event) => this.toggleCheckCoordinates(event));
        addListener('addCoordinatesButton', 'click', () => this.activateCoordinateSystem());
        addListener('rulerButton', 'click', () => this.activateTool(this.rulerTool));
        addListener('scalingButton', 'click', () => this.activateTool(this.scalingTool));

        document.addEventListener('mousedown', (event) => this.handleRightClick(event));
        document.addEventListener('contextmenu', (event) => event.preventDefault());

        this.setupModalFunctionality();
    }

    removeListeners() {
        this.listeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.listeners = [];
    }

    activateTool(tool) {
        if (this.currentTool) {
            this.currentTool.deactivate();
        }
        this.currentTool = tool;
        tool.activate();
        this.log(`${tool.constructor.name} tool activated.`);
    }

    toggleDeleteTool() {
        if (this.currentTool === this.drawing && this.drawing.isDeleteActive) {
            this.drawing.deactivateDelete();
            this.currentTool = null;
            this.log("Delete tool deactivated.");
        } else {
            this.activateTool(this.drawing);
            this.drawing.activateDelete();
            this.log("Delete tool activated.");
        }
    }

    toggleCheckCoordinates(event) {
        if (event.target.checked) {
            this.coordinateSystem.activateCheckCoordinates();
        } else {
            this.coordinateSystem.deactivateCheckCoordinates();
        }
    }

    activateCoordinateSystem() {
        if (this.currentTool) {
            this.currentTool.deactivate();
        }
        this.coordinateSystem.activate();
        this.highlightButton('addCoordinatesButton');
    }

    highlightButton(buttonId) {
        document.querySelectorAll('.navbar button').forEach(button => button.classList.remove('active'));
        document.getElementById(buttonId).classList.add('active');
    }

    handleRightClick(event) {
        if (event.button === 2) {
            if (this.currentTool) {
                this.currentTool.deactivate();
                this.currentTool = null;
            }
            event.preventDefault();
        }
    }

    handleZoom(event) {
        event.preventDefault(); // запобігання стандартній поведінці скролу
        const delta = Math.sign(event.deltaY);
        let scaleChange = delta * this.scaleIncrement;
        this.visualScale = Math.max(0.1, Math.min(this.visualScale - scaleChange, 10)); // збереження візуального масштабу в межах лімітів

        this.redrawImage(); // функція, що перерисовує зображення з новим візуальним масштабом
    }

    loadImage() {
        const imageUrl = this.projectManager.getImageUrl();
        if (!imageUrl) {
            this.log("No image URL found via ProjectManager.");
            return;
        }

        const image = new Image();
        image.onload = () => {
            this.handleImageLoad(image);
        };
        image.onerror = () => {
            this.log("Failed to load image from URL: " + imageUrl);
        };
        image.src = imageUrl;
    }

    handleImageLoad(image) {
        let height = this.secondCanvas.parentNode.offsetHeight;
        let width = image.width * (height / image.height);
        if (width > this.secondCanvas.parentNode.offsetWidth) {
            width = this.secondCanvas.parentNode.offsetWidth;
            height = image.height * (width / image.width);
        }

        this.secondCanvas.width = width;
        this.secondCanvas.height = height;
        this.imageCanvas.width = width;
        this.imageCanvas.height = height;

        this.secondCtx.drawImage(image, 0, 0, width, height);

        this.scaleParameters.setBoundingBoxParameters({ x: 0, y: 0, width: width, height: height });
        this.boundingBox = { x: 0, y: 0, width: width, height: height, isVisible: true };

        this.drawBoundingBoxOnSecondCanvas();
        this.drawing = new Drawing('imageCanvas', this.scaleParameters.getBoundingBoxParameters());
    }

    drawBoundingBoxOnSecondCanvas() {
        if (!this.boundingBox.isVisible) return;

        this.secondCtx.strokeStyle = 'blue';
        this.secondCtx.lineWidth = 2;
        this.secondCtx.strokeRect(0, 0, this.boundingBox.width, this.boundingBox.height);
    }

    redrawImage() {
        console.log("Redrawing image", this.imageCtx);
        if (!this.imageCtx) {
            console.error("Image context is not defined.");
            return;
        }
        this.imageCtx.clearRect(0, 0, this.secondCanvas.width, this.secondCanvas.height);
        this.loadImage(); // Call loadImage() instead of drawRasterImage()
        if (this.boundingBox.isVisible) {
            this.imageCtx.strokeStyle = 'black';
            this.imageCtx.lineWidth = 2;
            this.imageCtx.strokeRect(0, 0, this.boundingBox.width, this.boundingBox.height);
        }
    }

    log(message) {
        console.log(message);
        const logWindow = document.getElementById("logWindow");
        if (logWindow) {
            const messageElement = document.createElement("p");
            messageElement.textContent = message;
            logWindow.appendChild(messageElement);
            logWindow.scrollTop = logWindow.scrollHeight;
        }
    }

    setupModalFunctionality() {
        const listParametersButton = document.getElementById('listParametersButton');
        const navbarButtons = document.querySelectorAll('.navbar button');
        const parametersModal = document.getElementById('parametersModal');
        const parametersTable = document.getElementById('parametersTable');

        const updateActiveButton = () => {
            navbarButtons.forEach(button => button.classList.remove('active'));
            listParametersButton.classList.add('active');
        };

        const updateParametersTable = (data, coordinatesData, boundingBoxParams, projectData) => {
            const rows = [];
            rows.push(`<tr><th>Scale</th><td>${data.scale || 'N/A'}</td></tr>`);
            rows.push(`<tr><th>Measured Pixel Distance for Scaling</th><td>${data.measuredPixelDistanceForScaling || 'N/A'}</td></tr>`);
            rows.push(`<tr><th>Real Distance</th><td>${data.realDistance || 'N/A'}</td></tr>`);
            rows.push(`<tr><th>Scale Ratio</th><td>${data.scaleRatio || 'N/A'}</td></tr>`);

            coordinatesData.forEach((coord, index) => {
                rows.push(`<tr><th>Coord ${index + 1} Input</th><td>(${coord.inputXY.x}, ${coord.inputXY.y})</td></tr>`);
                rows.push(`<tr><th>Coord ${index + 1} Position</th><td>(${coord.positionXY.x}, ${coord.positionXY.y})</td></tr>`);
            });

            if (projectData) {
                rows.push(`<tr><th>Project Name</th><td>${projectData.projectName || 'N/A'}</td></tr>`);
                rows.push(`<tr><th>Building ID</th><td>${projectData.buildingID || 'N/A'}</td></tr>`);
                rows.push(`<tr><th>Building Level</th><td>${projectData.buildingLevel || 'N/A'}</td></tr>`);
                rows.push(`<tr><th>Raster URL</th><td>${projectData.rasterURL || 'N/A'}</td></tr>`);
            }

            if (boundingBoxParams) {
                rows.push(`<tr><th>Bounding Box Width</th><td>${boundingBoxParams.width || 'N/A'}</td></tr>`);
                rows.push(`<tr><th>Bounding Box Height</th><td>${boundingBoxParams.height || 'N/A'}</td></tr>`);
            }

            parametersTable.innerHTML = rows.join('');
        };

        listParametersButton.addEventListener('click', () => {
            const data = {
                scale: this.scaleParameters.getScale(),
                measuredPixelDistanceForScaling: this.scaleParameters.getMeasuredPixelDistanceForScaling(),
                realDistance: this.scaleParameters.getRealDistance(),
                scaleRatio: this.scaleParameters.getScaleRatio(),
            };
            const coordinatesData = this.scaleParameters.getCoordinates();
            const boundingBoxParams = this.scaleParameters.getBoundingBoxParameters();
            const projectData = this.scaleParameters.getProjectData();

            updateActiveButton();
            parametersModal.style.display = 'block';
            updateParametersTable(data, coordinatesData, boundingBoxParams, projectData);
        });

        document.querySelector('.close').addEventListener('click', () => {
            parametersModal.style.display = 'none';
            listParametersButton.classList.remove('active');
        });

        window.addEventListener('click', (event) => {
            if (event.target === parametersModal) {
                parametersModal.style.display = 'none';
                listParametersButton.classList.remove('active');
            }
        });
    }
}
