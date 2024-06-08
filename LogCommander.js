class LogCommander {
    constructor(logElementId, commandHandlers) {
        this.logElement = document.getElementById(logElementId);
        this.commandHandlers = commandHandlers; // Об'єкт з функціями обробниками для команд
        this.initialize();
    }

    initialize() {
        // Перевіряємо наявність елементу логу
        if (!this.logElement) {
            console.error('Log element not found');
            return;
        }

        // Встановлюємо слухача подій на зміни у логі
        this.logElement.addEventListener('DOMNodeInserted', event => {
            const message = event.target.textContent || event.target.innerText;
            this.processLogEntry(message);
        });
    }

    processLogEntry(message) {
        // Розбір повідомлення на команду та аргументи (якщо є)
        const command = message.split(' ')[0]; // Припустимо, що команда - це перше слово

        if (this.commandHandlers[command]) {
            // Виклик обробника команди, якщо він існує
            const response = this.commandHandlers[command]();
            this.log(`Response: ${response}`);
        }
    }

    log(message) {
        // Додаємо повідомлення до логу
        if (this.logElement) {
            const entry = document.createElement('div');
            entry.textContent = message;
            this.logElement.appendChild(entry);
        }
    }
}
