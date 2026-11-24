require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const chatRouter = require('./src/router/chat');
const consultasRouter = require('./src/router/consultas');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

// Configuracion de cors
app.use(
    cors({
        origin: "*",
        methods: "GET, POST",
        credentials: true,
    }),
);

// Archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'public')));

// ─── Rutas principales ────────────────────────────────────────────────────────

// ChatBot (lógica principal del negocio)
app.use('/api', chatRouter);

// Consultas de verificación (solo GET, no es lógica del negocio)
app.use('/api/consultas', consultasRouter);

// ─── Manejo de errores global ─────────────────────────────────────────────────
app.use((err, req, res) => {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor.' });
});

// ─── Inicio del servidor ──────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
