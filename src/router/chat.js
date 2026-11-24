// Router principal del ChatBot.
// POST /api/chat  → Endpoint principal del chatbot.

const { Router } = require('express');
const { procesarMensaje } = require('../chatbot/chatService');
const { verificarListaNegra } = require('../chatbot/blacklist');

const router = Router();

/**
 * POST /api/chat
 *
 * Body JSON:
 * {
 *   "mensaje": "string",        // Mensaje del usuario (requerido)
 *   "thread_id": "string"       // ID del hilo de conversación (opcional, para continuar conversación)
 * }
 *
 * Response JSON:
 * {
 *   "respuesta": "string",      // Respuesta del chatbot
 *   "thread_id": "string"       // ID del hilo actualizado (usar en la siguiente petición)
 * }
 */
router.post('/chat', async (req, res) => {
    const { mensaje, thread_id } = req.body;

    // Validar que se envió un mensaje
    if (!mensaje || typeof mensaje !== 'string' || mensaje.trim() === '') {
        return res.status(400).json({
            error: 'El campo "mensaje" es requerido y no puede estar vacío.'
        });
    }

    const mensajeLimpio = mensaje.trim();

    // Verificar lista negra
    const { encontrada } = verificarListaNegra(mensajeLimpio);
    if (encontrada) {
        return res.status(200).json({
            respuesta: `Hola, lamento informarte que no puedo atender consultas relacionadas con ese tipo de contenido. 🚫 Estoy aquí para ayudarte con todo lo relacionado a nuestra tienda de electrónica. ¿En qué más puedo ayudarte? 😊`,
            thread_id: thread_id || null,
            bloqueado: true
        });
    }

    // Procesar el mensaje con el chatbot
    const { respuesta, threadId } = await procesarMensaje(mensajeLimpio, thread_id || null);

    return res.status(200).json({
        respuesta,
        thread_id: threadId
    });
});

module.exports = router;
