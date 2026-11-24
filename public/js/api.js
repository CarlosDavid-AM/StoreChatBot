const ChatAPI = {
    ENDPOINT: 'http://localhost:3000/api/chat',

    async sendMessage(mensaje, threadId = '') {
        const payload = {
            mensaje: mensaje,
            thread_id: threadId || ''
        };

        const response = await fetch(this.ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error('Error en la comunicación con el servidor');
        }

        return await response.json();
    }
};
