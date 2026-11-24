// Lista negra de palabras prohibidas.
// El chatbot rechazará cualquier mensaje que contenga alguna de estas palabras.
const BLACKLIST = [
    'muerte', 'matar', 'asesinar', 'armas', 'arma', 'pistola', 'rifle',
    'explosivo', 'bomba', 'granada', 'cuchillo', 'navaja',
    'alcohol', 'cerveza', 'licor', 'droga', 'narcótico', 'narcóticos',
    'cocaína', 'heroína', 'marihuana',
    'hack', 'hackear', 'virus', 'malware', 'ransomware', 'phishing',
    'robar', 'robo', 'estafa', 'fraude',
    'pornografía', 'sexual', 'sexo',
    'suicidio', 'suicidarme', 'suicidarme',
    'odio', 'racismo', 'racista', 'discriminación'
];

/**
 * Verifica si el mensaje contiene palabras de la lista negra.
 * @param {string} mensaje
 * @returns {{ encontrada: boolean, palabra: string|null }}
 */
function verificarListaNegra(mensaje) {
    const mensajeLower = mensaje.toLowerCase();
    for (const palabra of BLACKLIST) {
        if (mensajeLower.includes(palabra)) {
            return { encontrada: true, palabra };
        }
    }
    return { encontrada: false, palabra: null };
}

module.exports = { verificarListaNegra, BLACKLIST };
