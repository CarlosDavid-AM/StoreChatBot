// Servicio principal del ChatBot.
// Gestiona el hilo (thread) de conversación y el loop de tool calling con la Responses API de OpenAI.

const client = require('../config/openai');
const tools = require('./tools');
const { ejecutarTool } = require('./toolHandlers');

// Instrucciones del sistema: define la personalidad, el alcance y las reglas del chatbot.
const SYSTEM_INSTRUCTIONS = `
Eres un asistente virtual amable y profesional de una tienda de artículos electrónicos.
Tu nombre es "TechBot".

## Tu personalidad y comportamiento:
- Saluda cordialmente al inicio de cada conversación.
- Agradece cada consulta del cliente.
- Usa expresiones amables: "¡Con gusto!", "¡Claro que sí!", "¡Por supuesto!", "¡Gracias por preguntar!".
- Nunca respondas de forma agresiva, brusca o irrespetuosa.
- Despídete cordialmente cuando el cliente lo indique.
- Mantén siempre un tono positivo, paciente y servicial.

## Tu alcance (SOLO puedes ayudar con):
- Información sobre productos de la tienda (computadoras, periféricos, electrónica).
- Especificaciones técnicas de los productos.
- Precios y métodos de pago disponibles.
- Disponibilidad y stock de productos.
- Proceso de compra (cómo comprar, qué métodos de pago se aceptan).
- Productos más consultados o populares.

## Proceso de compra (responde sin usar herramientas):
- Los clientes pueden pagar con EFECTIVO o VISA según el producto.
- Para comprar, el cliente debe visitar la tienda o contactar por teléfono.
- Se ofrece garantía según el producto (en meses).
- El stock es limitado; si hay disponible, puede adquirirse de inmediato.

## Lo que NO debes hacer:
- NO respondas preguntas ajenas al negocio de electrónica (política, recetas, chistes, etc.).
- Si te preguntan algo fuera de tu alcance, indica amablemente que solo puedes ayudar con temas de la tienda.
- NO inventes información sobre productos. Siempre usa las herramientas disponibles para obtener datos reales.
- SIEMPRE registra la consulta (usa 'registrar_consulta') cuando el cliente consulte un producto específico.

## Formato de respuesta:
- Usa un lenguaje claro y fácil de entender.
- Cuando muestres especificaciones, precios o listas, usa formato ordenado.
- No uses jerga técnica innecesaria; explica en términos simples si es necesario.
`.trim();

/**
 * Procesa un mensaje del usuario y devuelve la respuesta del chatbot.
 * Implementa el loop de tool calling de la Responses API.
 *
 * @param {string} mensajeUsuario      - El mensaje del cliente
 * @param {string|null} previousId     - ID de la respuesta anterior (para mantener el hilo)
 * @returns {Promise<{ respuesta: string, threadId: string }>}
 */
async function procesarMensaje(mensajeUsuario, previousId = null) {
    // Parámetros base de la llamada a la Responses API
    const params = {
        model: process.env.MODEL || 'gpt-4o',
        instructions: SYSTEM_INSTRUCTIONS,
        input: mensajeUsuario,
        tools: tools
    };

    // Si hay un hilo previo, continuamos la conversación usando previous_response_id
    if (previousId) {
        params.previous_response_id = previousId;
    }

    // Primera llamada a la API
    let response = await client.responses.create(params);

    // Loop de tool calling: mientras el modelo quiera usar herramientas, las ejecutamos
    while (response.status === 'requires_action' || _tieneToolCalls(response)) {
        const toolCalls = _extraerToolCalls(response);

        if (toolCalls.length === 0) break;

        // Ejecutar todas las herramientas solicitadas
        const toolResults = [];
        for (const toolCall of toolCalls) {
            const args = typeof toolCall.arguments === 'string'
                ? JSON.parse(toolCall.arguments)
                : toolCall.arguments;

            const output = await ejecutarTool(toolCall.name, args);

            toolResults.push({
                type: 'function_call_output',
                call_id: toolCall.call_id,
                output
            });
        }

        // Enviar los resultados de las herramientas al modelo
        response = await client.responses.create({
            model: params.model,
            previous_response_id: response.id,
            input: toolResults,
            tools: tools
        });
    }

    // Extraer el texto de la respuesta final
    const textoRespuesta = _extraerTexto(response);

    return {
        respuesta: textoRespuesta,
        threadId: response.id
    };
}

/**
 * Verifica si la respuesta contiene tool calls pendientes.
 */
function _tieneToolCalls(response) {
    if (!response.output || !Array.isArray(response.output)) return false;
    return response.output.some(item => item.type === 'function_call');
}

/**
 * Extrae los tool calls de la respuesta.
 */
function _extraerToolCalls(response) {
    if (!response.output || !Array.isArray(response.output)) return [];
    return response.output
        .filter(item => item.type === 'function_call')
        .map(item => ({
            call_id: item.call_id || item.id,
            name: item.name,
            arguments: item.arguments
        }));
}

/**
 * Extrae el texto de la respuesta final del modelo.
 */
function _extraerTexto(response) {
    if (!response.output || !Array.isArray(response.output)) {
        return 'Lo siento, no pude procesar tu consulta en este momento. ¿Podrías intentarlo de nuevo?';
    }

    for (const item of response.output) {
        if (item.type === 'message') {
            const content = item.content;
            if (Array.isArray(content)) {
                const textPart = content.find(c => c.type === 'output_text' || c.type === 'text');
                if (textPart) return textPart.text;
            } else if (typeof content === 'string') {
                return content;
            }
        }
    }

    return 'Lo siento, no pude procesar tu consulta en este momento. ¿Podrías intentarlo de nuevo?';
}

module.exports = { procesarMensaje };
