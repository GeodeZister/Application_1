export class RoomManager {
    constructor(canvasId, scaleParameters) {
        this.canvas = document.getElementById(canvasId);
        this.scaleParameters = scaleParameters;
        if (this.canvas) {
            paper.setup(this.canvas);
            this.rooms = [];
            this.isActive = false;
            this.currentPolygon = null;
            this.currentVertices = [];
            this.tempLine = null;
            this.vertexSnapDistance = 10;

            this.setupListeners();
        } else {
            console.error(`Canvas with id '${canvasId}' not found.`);
        }
    }

    setupListeners() {
        this.canvas.addEventListener('mousedown', (event) => this.handleMouseDown(event));
        this.canvas.addEventListener('mousemove', (event) => this.handleMouseMove(event));
    }

    handleMouseDown(event) {
        if (!this.isActive) return;

        const point = this.getMousePosition(event);

        if (event.button === 0) {
            this.addVertex(point);
        } else if (event.button === 2) {
            this.finishPolygon();
        }
    }

    handleMouseMove(event) {
        if (!this.isActive || !this.currentPolygon) return;

        const point = this.getMousePosition(event);
        this.updateTempLine(point);
    }

    getMousePosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        return new paper.Point(
            event.clientX - rect.left,
            event.clientY - rect.top
        );
    }

    addVertex(point) {
        point = this.snapToExistingVertex(point);

        if (!this.currentPolygon) {
            this.currentPolygon = new paper.Path({
                strokeColor: 'black',
                strokeWidth: 2,
                closed: false,
                fillColor: new paper.Color(1, 1, 0, 0.5)
            });
            this.currentVertices = [];
        }

        this.currentPolygon.add(point);
        this.currentVertices.push(point);

        this.createTempLine(point);
        paper.view.update();
    }

    snapToExistingVertex(point) {
        for (const room of this.rooms) {
            for (const vertex of room.vertices) {
                if (point.getDistance(vertex) <= this.vertexSnapDistance) {
                    return vertex;
                }
            }
        }
        return point;
    }

    createTempLine(startPoint) {
        if (this.tempLine) {
            this.tempLine.remove();
        }

        this.tempLine = new paper.Path.Line({
            from: startPoint,
            to: startPoint,
            strokeColor: 'gray',
            strokeWidth: 2
        });
        paper.view.update();
    }

    updateTempLine(endPoint) {
        if (this.tempLine) {
            this.tempLine.segments[1].point = endPoint;
            paper.view.update();
        }
    }

    finishPolygon() {
        if (this.currentPolygon && this.currentVertices.length > 2) {
            if (!this.currentPolygon.closed) {
                this.currentPolygon.add(this.currentVertices[0]);
                this.currentPolygon.closed = true;
            }

            const roomName = prompt("Enter room name:");
            if (roomName) {
                const roomID = this.generateRoomID();
                this.rooms.push({
                    id: roomID,
                    name: roomName,
                    vertices: this.currentVertices,
                    polygon: this.currentPolygon
                });

                this.labelRoom(this.currentPolygon, roomName);
                console.log(`Added room ID: ${roomID}, Name: ${roomName}, Vertices:`, this.currentVertices);
            } else {
                this.currentPolygon.remove();
            }
        }

        if (this.tempLine) {
            this.tempLine.remove();
            this.tempLine = null;
        }

        this.currentPolygon = null;
        this.currentVertices = [];
        paper.view.update();
    }

    labelRoom(polygon, name) {
        const center = polygon.bounds.center;
        const text = new paper.PointText({
            point: center,
            content: name,
            fillColor: 'black',
            fontSize: 12,
            justification: 'center'
        });
        polygon.insertBelow(text);
    }

    generateRoomID() {
        const buildingID = this.scaleParameters.getBuildingID().toString().padStart(3, '0');
        const buildingLevel = this.scaleParameters.getBuildingLevel().toString().padStart(2, '0');
        const roomID = (this.rooms.length + 1).toString().padStart(3, '0');
        return `${buildingID}${buildingLevel}${roomID}`;
    }

    getRooms() {
        return this.rooms;
    }

    addRoom(vertices, name, id) {
        //console.log(`addRoom called with vertices:`, vertices, `name: ${name}, id: ${id}`);
        const polygon = new paper.Path({
            segments: vertices,
            strokeColor: 'black',
            strokeWidth: 2,
            closed: true,
            fillColor: new paper.Color(1, 1, 0, 0.5)
        });

        this.rooms.push({
            id: id || this.generateRoomID(),
            name: name,
            vertices: vertices,
            polygon: polygon
        });

        this.labelRoom(polygon, name);
        //console.log(`Loaded room ID: ${id}, Name: ${name}, Vertices:`, vertices);
        paper.view.update();
    }

    activate() {
        this.isActive = true;
        console.log('Room drawing tool activated');
    }

    deactivate() {
        this.isActive = false;
        this.currentPolygon = null;
        this.currentVertices = [];
        if (this.tempLine) {
            this.tempLine.remove();
            this.tempLine = null;
        }
        console.log('Room drawing tool deactivated');
    }

    createRoomsTable() {
        const rooms = this.getRooms();
        const table = document.createElement('table');
        table.setAttribute('border', '1');

        const headerRow = document.createElement('tr');
        const headers = ['ID', 'Name', 'Vertices'];
        headers.forEach(headerText => {
            const header = document.createElement('th');
            const textNode = document.createTextNode(headerText);
            header.appendChild(textNode);
            headerRow.appendChild(header);
        });
        table.appendChild(headerRow);

        rooms.forEach(room => {
            const row = document.createElement('tr');

            const idCell = document.createElement('td');
            idCell.textContent = room.id;
            row.appendChild(idCell);

            const nameCell = document.createElement('td');
            nameCell.textContent = room.name;
            row.appendChild(nameCell);

            const verticesCell = document.createElement('td');
            verticesCell.textContent = room.vertices.map(v => `(${v.x.toFixed(2)}, ${v.y.toFixed(2)})`).join(', ');
            row.appendChild(verticesCell);

            table.appendChild(row);
        });

        const existingModal = document.getElementById('roomsModal');
        if (existingModal) {
            document.body.removeChild(existingModal);
        }

        const modal = document.createElement('div');
        modal.id = 'roomsModal';
        modal.style.cssText = `
            position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%);
            z-index: 100; padding: 20px; background: white; border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);`;
        modal.appendChild(table);

        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.addEventListener('click', () => document.body.removeChild(modal));
        modal.appendChild(closeButton);

        document.body.appendChild(modal);
    }

    toggleRoomsVisibility() {
        this.rooms.forEach(room => {
            room.polygon.visible = !room.polygon.visible;
        });
        paper.view.update();
    }
}