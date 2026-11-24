const { OpenAI } = require('openai');
require('dotenv').config();

const client = new OpenAI({
    apiKey: process.env.CLAVE,
    baseURL: process.env.PUNTO_CONECCION
});

module.exports = client;
