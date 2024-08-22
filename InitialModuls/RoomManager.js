export class RoomManager {
    constructor(canvasId, scaleParameters) {
        this.canvas = document.getElementById(canvasId);
        this.scaleParameters = scaleParameters;
        this.rooms = [];
        this.isActive = false;
        this.currentPage = 1; // Поточна сторінка
        this.roomsPerPage = 10; // Кількість кімнат на сторінці

        if (this.canvas) {
            paper.setup(this.canvas);
            this.roomLayer = new paper.Layer(); // Створюємо окремий шар для кімнат
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
        this.canvas.addEventListener('mousedown', this.handleMouseEvent.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseEvent.bind(this));
        this.canvas.addEventListener('contextmenu', (event) => event.preventDefault()); // Забороняємо контекстне меню
    }

    handleMouseEvent(event) {
        if (!this.isActive) return;

        const point = this.getMousePosition(event);

        if (event.type === 'mousedown' && event.button === 0) {
            this.addVertex(point);
        } else if (event.type === 'mousedown' && event.button === 2) {
            this.finishPolygon();
        } else if (event.type === 'mousemove') {
            this.updateTempLine(point);
        }
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
            this.startPolygon(point);
        } else {
            this.currentPolygon.add(point);
            this.currentVertices.push(point);
        }

        this.createTempLine(point);
        paper.view.update();
    }

    startPolygon(point) {
        this.currentPolygon = new paper.Path({
            strokeColor: 'black',
            strokeWidth: 2,
            closed: false,
            fillColor: new paper.Color(1, 1, 0, 0.5)
        });
        this.currentVertices = [point];
        this.currentPolygon.add(point); // Додаємо перший пункт у полігон
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
        // Перевірити, чи кімната вже існує, і якщо так, оновити її
        let room = this.rooms.find(room => room.id === id);
        if (room) {
            // Оновити існуючу кімнату
            room.vertices = vertices;
            room.name = name;
            room.polygon.remove(); // Видалити старий полігон з канвасу
        } else {
            // Додати нову кімнату
            room = {
                id: id || this.generateRoomID(),
                name: name,
                vertices: vertices,
                polygon: null
            };
            this.rooms.push(room);
        }

        // Малюємо кімнату на окремому шарі
        this.roomLayer.activate();

        room.polygon = new paper.Path({
            segments: vertices,
            strokeColor: 'black',
            strokeWidth: 2,
            closed: true,
            fillColor: new paper.Color(1, 1, 0, 0.5)
        });

        this.labelRoom(room.polygon, name);
        paper.view.update();
    }



    deleteRoom(roomId) {
        const roomIndex = this.rooms.findIndex(room => room.id === roomId);
        if (roomIndex !== -1) {
            const room = this.rooms[roomIndex];
            room.polygon.remove();
            this.rooms.splice(roomIndex, 1);
            paper.view.update();
            console.log(`Deleted room ID: ${roomId}`);
        }
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
        const startIndex = (this.currentPage - 1) * this.roomsPerPage;
        const endIndex = startIndex + this.roomsPerPage;
        const rooms = this.getRooms().slice(startIndex, endIndex);
        const table = document.createElement('table');
        table.setAttribute('border', '1');

        const headerRow = document.createElement('tr');
        const headers = ['ID', 'Name', 'Vertices', 'Actions'];
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
            nameCell.contentEditable = true; // Зробити редагованим
            nameCell.textContent = room.name;
            nameCell.addEventListener('input', (e) => this.updateRoomName(room.id, e.target.textContent));
            row.appendChild(nameCell);

            const verticesCell = document.createElement('td');
            verticesCell.contentEditable = true; // Зробити редагованим
            verticesCell.textContent = room.vertices.map(v => `(${v.x.toFixed(2)}, ${v.y.toFixed(2)})`).join(', ');
            verticesCell.addEventListener('input', (e) => this.updateRoomVertices(room.id, e.target.textContent));
            row.appendChild(verticesCell);

            const actionsCell = document.createElement('td');
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => this.deleteRoom(room.id));
            actionsCell.appendChild(deleteButton);
            row.appendChild(actionsCell);

            table.appendChild(row);
        });

        // Додати рядок з інформацією про загальну кількість кімнат
        const totalRoomsRow = document.createElement('tr');
        const totalRoomsCell = document.createElement('td');
        totalRoomsCell.colSpan = 4; // Розтягнути на всю ширину таблиці
        totalRoomsCell.textContent = `Total rooms: ${this.rooms.length}`;
        totalRoomsRow.appendChild(totalRoomsCell);
        table.appendChild(totalRoomsRow);

        const existingModal = document.getElementById('roomsModal');
        if (existingModal) {
            document.body.removeChild(existingModal);
        }

        const modal = document.createElement('div');
        modal.id = 'roomsModal';
        modal.style.cssText = `
            position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%);
            z-index: 100; padding: 20px; background: white; border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1); resize: both; overflow: auto;`;

        const header = document.createElement('div');
        header.style.cssText = `
            padding: 10px; cursor: move; z-index: 10; background: #2196F3; color: #fff; border-radius: 10px 10px 0 0;`;
        header.textContent = 'Rooms Table';
        modal.appendChild(header);

        modal.appendChild(table);

        // Пагінація
        const paginationDiv = this.createPaginationControls();
        modal.appendChild(paginationDiv);

        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.addEventListener('click', () => document.body.removeChild(modal));
        modal.appendChild(closeButton);

        document.body.appendChild(modal);

        this.makeElementDraggable(modal, header);
    }

    updateRoomName(roomId, newName) {
        const room = this.rooms.find(room => room.id === roomId);
        if (room) {
            room.name = newName;
            this.redrawAllRooms();
        }
    }

    updateRoomVertices(roomId, newVerticesText) {
        const room = this.rooms.find(room => room.id === roomId);
        if (room) {
            const newVertices = this.parseVertices(newVerticesText);
            if (newVertices) {
                room.vertices = newVertices;
                this.redrawAllRooms();
            }
        }
    }

    redrawAllRooms() {
        // Очищення тільки шару з кімнатами
        this.roomLayer.removeChildren();

        // Перемалювати всі кімнати знову
        this.rooms.forEach(room => {
            this.addRoom(room.vertices, room.name, room.id);
        });

        paper.view.update();
    }

    parseVertices(verticesText) {
        try {
            const vertices = verticesText.match(/\(([^)]+)\)/g).map(v => {
                const [x, y] = v.replace(/[()]/g, '').split(',').map(Number);
                return new paper.Point(x, y);
            });
            return vertices;
        } catch (error) {
            console.error('Invalid vertices format:', error);
            alert('Invalid vertices format. Please use the format (x, y), (x, y), ...');
            return null;
        }
    }


    createPaginationControls() {
        const paginationDiv = document.createElement('div');
        paginationDiv.style.cssText = 'margin-top: 10px; text-align: center;';

        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.disabled = this.currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.createRoomsTable();
            }
        });

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.disabled = this.currentPage * this.roomsPerPage >= this.getRooms().length;
        nextButton.addEventListener('click', () => {
            if (this.currentPage * this.roomsPerPage < this.getRooms().length) {
                this.currentPage++;
                this.createRoomsTable();
            }
        });

        paginationDiv.appendChild(prevButton);
        paginationDiv.appendChild(nextButton);

        return paginationDiv;
    }

    makeElementDraggable(element, handle) {
        let offsetX, offsetY, isDown = false;

        handle.addEventListener('mousedown', (e) => {
            isDown = true;
            offsetX = e.clientX - element.offsetLeft;
            offsetY = e.clientY - element.offsetTop;
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', stop);
        });

        const move = (e) => {
            if (!isDown) return;
            element.style.left = `${e.clientX - offsetX}px`;
            element.style.top = `${e.clientY - offsetY}px`;
        };

        const stop = () => {
            isDown = false;
            document.removeEventListener('mousemove', move);
            document.removeEventListener('mouseup', stop);
        };
    }

    toggleRoomsVisibility() {
        this.rooms.forEach(room => {
            room.polygon.visible = !room.polygon.visible;
        });
        paper.view.update();
    }
}
