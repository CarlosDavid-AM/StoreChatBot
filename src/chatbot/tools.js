// Definición de herramientas (tools) para el Function/Tool Calling de OpenAI Responses API.
// Cada herramienta tiene su propia descripción y esquema de parámetros.

const tools = [
    {
        type: 'function',
        name: 'buscar_productos',
        description: 'Busca productos en la tienda. Permite filtrar por categoría, marca, modelo o buscar todos los productos disponibles. Úsalo cuando el cliente pregunte qué productos hay, qué marcas se venden o busque un producto específico.',
        parameters: {
            type: 'object',
            properties: {
                categoria: {
                    type: 'string',
                    description: 'Categoría del producto (ej: Informática, Periféricos). Dejar vacío para todas las categorías.'
                },
                marca: {
                    type: 'string',
                    description: 'Marca del producto (ej: DELL, LOGITECH). Dejar vacío para todas las marcas.'
                },
                modelo: {
                    type: 'string',
                    description: 'Modelo del producto (ej: G203, M90). Dejar vacío para todos los modelos.'
                },
                solo_disponibles: {
                    type: 'boolean',
                    description: 'Si es true, solo retorna productos con disponible=true y stock > 0. Por defecto true.'
                }
            },
            required: []
        }
    },
    {
        type: 'function',
        name: 'obtener_especificaciones',
        description: 'Obtiene las especificaciones técnicas detalladas de un producto por su ID. Úsalo cuando el cliente pregunte por datos técnicos, características o especificaciones de un producto.',
        parameters: {
            type: 'object',
            properties: {
                id_producto: {
                    type: 'integer',
                    description: 'El ID numérico del producto del cual se quieren conocer las especificaciones.'
                }
            },
            required: ['id_producto']
        }
    },
    {
        type: 'function',
        name: 'registrar_consulta',
        description: 'Registra en la base de datos que un producto fue consultado por un cliente. Llama a esta herramienta SIEMPRE que un cliente consulte o pregunte sobre un producto específico (por ID), inmediatamente después de haber obtenido la información del producto.',
        parameters: {
            type: 'object',
            properties: {
                id_producto: {
                    type: 'integer',
                    description: 'El ID del producto que fue consultado por el cliente.'
                }
            },
            required: ['id_producto']
        }
    },
    {
        type: 'function',
        name: 'consultar_precio_y_pago',
        description: 'Consulta el precio y el método de pago aceptado de un producto específico. Úsalo cuando el cliente pregunte por el precio, costo, valor, método de pago o cómo pagar un producto.',
        parameters: {
            type: 'object',
            properties: {
                id_producto: {
                    type: 'integer',
                    description: 'El ID del producto del cual se quiere saber el precio y método de pago.'
                }
            },
            required: ['id_producto']
        }
    },
    {
        type: 'function',
        name: 'verificar_stock',
        description: 'Verifica la disponibilidad y el stock actual de un producto. Úsalo cuando el cliente pregunte si un producto está disponible, cuántas unidades hay, si está en stock o si lo pueden comprar.',
        parameters: {
            type: 'object',
            properties: {
                id_producto: {
                    type: 'integer',
                    description: 'El ID del producto a verificar disponibilidad y stock.'
                }
            },
            required: ['id_producto']
        }
    },
    {
        type: 'function',
        name: 'obtener_productos_mas_consultados',
        description: 'Obtiene un ranking de los productos más consultados por los clientes. Úsalo cuando el cliente pregunte cuáles son los productos más populares, más vistos o más consultados.',
        parameters: {
            type: 'object',
            properties: {
                limite: {
                    type: 'integer',
                    description: 'Cantidad máxima de productos a retornar en el ranking. Por defecto 5.'
                }
            },
            required: []
        }
    }
];

module.exports = tools;
