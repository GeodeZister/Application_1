export class ScaleParameters {
    constructor() {
        this.scale = null;
        this.measuredPixelDistanceForScaling = null;
        this.realDistance = null;
        this.scaleRatio = null;
        this.coordinatesList = [];
        this.originPosition = { x: null, y: null };
        this.boundingBoxParameters = { x: null, y: null, width: null, height: null };
        this.projectData = {}; // Додано buildingID та buildingLevel як частини projectData
        this.directionalAngle = null;
        this.globalCoordinates = [];
        this.floorData = {}; // Додано для збереження даних поверху
    }

    // Getter and setter for raster URL
    getRasterURL() {
        return this.projectData ? this.projectData.rasterURL : null;
    }

    setRasterURL(rasterURL) {
        if (this.projectData) {
            this.projectData.rasterURL = rasterURL;
            console.log("Raster URL updated in ScaleParameters:", rasterURL);
        } else {
            console.error("Project data not initialized. Cannot set rasterURL.");
        }
    }

    // Setter and Getter for Project Data
    setProjectData(data) {
        this.projectData = data;
        console.log("Project data stored in ScaleParameters:", this.projectData);
    }

    getProjectData() {
        return this.projectData;
    }

    // Setter and Getter for Floor Data
    setFloorData(floorData) {
        this.floorData = floorData;
        console.log("Floor data stored in ScaleParameters:", this.floorData);
    }

    getFloorData() {
        return this.floorData;
    }

    // Setter and Getter for Building ID
    setBuildingID(buildingID) {
        this.projectData.buildingID = buildingID;
        console.log(`Building ID stored in ScaleParameters: ${this.projectData.buildingID}`);
    }

    getBuildingID() {
        return this.projectData.buildingID;
    }

    // Setter and Getter for Building Level
    setBuildingLevel(buildingLevel) {
        this.projectData.buildingLevel = buildingLevel;
        console.log(`Building Level stored in ScaleParameters: ${this.projectData.buildingLevel}`);
    }

    getBuildingLevel() {
        return this.projectData.buildingLevel;
    }

    // Methods for bounding box parameters
    setBoundingBoxParameters({ x, y, width, height }) {
        this.boundingBoxParameters = { x, y, width, height };
        console.log(`BoundingBox parameters updated: ${JSON.stringify(this.boundingBoxParameters)}`);
    }

    getBoundingBoxParameters() {
        return this.boundingBoxParameters;
    }

    // Methods for scale parameters
    setScaleParameters({ scale, measuredPixelDistanceForScaling, realDistance, scaleRatio }) {
        this.scale = scale;
        this.measuredPixelDistanceForScaling = measuredPixelDistanceForScaling;
        this.realDistance = realDistance;
        this.scaleRatio = scaleRatio;
    }

    getScale() {
        return this.scale;
    }

    setScale(scale) {
        this.scale = scale;
    }

    getMeasuredPixelDistanceForScaling() {
        return this.measuredPixelDistanceForScaling;
    }

    setMeasuredPixelDistanceForScaling(measuredPixelDistanceForScaling) {
        this.measuredPixelDistanceForScaling = measuredPixelDistanceForScaling;
    }

    getRealDistance() {
        return this.realDistance;
    }

    setRealDistance(realDistance) {
        this.realDistance = realDistance;
    }

    getScaleRatio() {
        return this.scaleRatio;
    }

    setScaleRatio(scaleRatio) {
        this.scaleRatio = scaleRatio;
    }

    // Method to calculate pixels per meter
    getPixelsPerMeter() {
        const measuredPixel = parseFloat(this.getMeasuredPixelDistanceForScaling());
        const realDistance = parseFloat(this.getRealDistance());

        if (realDistance > 0) {
            return measuredPixel / realDistance;
        } else {
            console.error("Real distance is not set or equal to zero.");
            return null;
        }
    }

    // Methods for coordinates
    addCoordinates(inputXY, positionXY) {
        this.coordinatesList.push({ inputXY, positionXY });
        console.log(`Coordinates added: ${JSON.stringify({ inputXY, positionXY })}`);
    }

    getCoordinates() {
        return this.coordinatesList;
    }

    getDirectionalAngle() {
        return this.directionalAngle;
    }

    setDirectionalAngle(directionalAngle) {
        this.directionalAngle = directionalAngle;
    }

    // Methods for origin position
    setOriginPosition(x, y) {
        this.originPosition.x = x;
        this.originPosition.y = y;
    }

    getOriginPosition() {
        return this.originPosition;
    }

    // Method to log scale parameters for debugging
    logScaleParameters() {
        console.log(`Scale: ${this.scale}`);
        console.log(`Measured Pixel Distance for Scaling: ${this.measuredPixelDistanceForScaling}`);
        console.log(`Real Distance: ${this.realDistance}`);
        console.log(`Scale Ratio: 1:${this.scaleRatio}`);
    }

    addGlobalCoordinates(globalCoordinates) {
        this.globalCoordinates.push(globalCoordinates);
        console.log(`Global coordinates added: ${JSON.stringify(globalCoordinates)}`);
    }

    getGlobalCoordinates() {
        return this.globalCoordinates;
    }
}
