// AngleDetection.js
export class AngleDetection {
    constructor(canvasId, scaleParameters) {
        this.canvas = document.getElementById(canvasId);
        this.scaleParameters = scaleParameters; // Add ScaleParameters
        if (this.canvas) {
            paper.setup(this.canvas);
            this.isActive = false;
            this.startPoint = null;
            this.endPoint = null;
            this.arrow = null;
            this.setupListeners();
        } else {
            console.error(`Canvas with id '${canvasId}' not found.`);
        }
    }

    setupListeners() {
        this.canvas.addEventListener('mousedown', (event) => this.handleMouseDown(event));
        this.canvas.addEventListener('mousemove', (event) => this.handleMouseMove(event));
        this.canvas.addEventListener('mouseup', (event) => this.handleMouseUp(event));
    }

    getMousePosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        return new paper.Point(
            event.clientX - rect.left,
            event.clientY - rect.top
        );
    }

    handleMouseDown(event) {
        if (!this.isActive) return;
        this.startPoint = this.getMousePosition(event);
    }

    handleMouseMove(event) {
        if (!this.isActive || !this.startPoint) return;
        this.endPoint = this.getMousePosition(event);
        this.updateArrow();
    }

    handleMouseUp(event) {
        if (!this.isActive) return;
        this.endPoint = this.getMousePosition(event);
        this.updateArrow();
        this.calculateAngle();
        this.startPoint = null;
        this.endPoint = null;
    }

    updateArrow() {
        if (this.arrow) {
            this.arrow.remove();
        }
        if (this.startPoint && this.endPoint) {
            this.arrow = new paper.Path();
            this.arrow.add(this.startPoint);
            this.arrow.add(this.endPoint);
            this.arrow.strokeColor = 'red';
            this.arrow.strokeWidth = 2;

            const arrowHeadLength = 10;
            const arrowHeadAngle = 30;
            const direction = this.endPoint.subtract(this.startPoint);
            const angle = direction.angle;
            const head1 = this.endPoint.add(
                new paper.Point({
                    length: arrowHeadLength,
                    angle: angle - 180 + arrowHeadAngle
                })
            );
            const head2 = this.endPoint.add(
                new paper.Point({
                    length: arrowHeadLength,
                    angle: angle - 180 - arrowHeadAngle
                })
            );

            this.arrow.add(head1);
            this.arrow.add(this.endPoint);
            this.arrow.add(head2);
        }
        paper.view.update();
    }

    calculateAngle() {
        if (this.startPoint && this.endPoint) {
            const direction = this.endPoint.subtract(this.startPoint);
            let angle = direction.angle + 90; // Correct angle to have 0 degrees pointing upwards

            // Adjust angle to be between 0 and 360 degrees
            if (angle < 0) {
                angle += 360;
            }

            console.log(`Directional angle: ${angle.toFixed(2)} degrees`);

            // Update ScaleParameters with the directional angle
            this.scaleParameters.setDirectionalAngle(angle);

            // Display angle in a user-friendly way
            const angleDisplay = document.getElementById('angleDisplay');
            if (angleDisplay) {
                angleDisplay.textContent = `Directional Angle: ${angle.toFixed(2)} degrees`;
            }

            // Remove the arrow after calculating the angle
            if (this.arrow) {
                this.arrow.remove();
                this.arrow = null;
                paper.view.update();
            }
        }
    }

    activate() {
        this.isActive = true;
        console.log('Angle detection tool activated');
    }

    deactivate() {
        this.isActive = false;
        console.log('Angle detection tool deactivated');
    }
}
