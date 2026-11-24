// Manejadores de cada herramienta (tool handler).
// Cada función ejecuta su propia consulta SQL independiente a la base de datos.

const pool = require('../config/db');

/**
 * Busca productos con filtros opcionales.
 */
async function buscar_productos({ categoria, marca, modelo, solo_disponibles = true }) {
    let sql = `
        SELECT
            id,
            categoria,
            marca,
            modelo,
            descripcion,
            garantia,
            stock,
            metodo_pago,
            precio,
            disponible
        FROM productos
        WHERE 1=1
    `;
    const params = [];

    if (categoria) {
        sql += ' AND categoria LIKE ?';
        params.push(`%${categoria}%`);
    }
    if (marca) {
        sql += ' AND marca LIKE ?';
        params.push(`%${marca}%`);
    }
    if (modelo) {
        sql += ' AND modelo LIKE ?';
        params.push(`%${modelo}%`);
    }
    if (solo_disponibles) {
        sql += ' AND disponible = TRUE AND stock > 0';
    }

    sql += ' ORDER BY categoria, marca, modelo';

    const [rows] = await pool.query(sql, params);

    if (rows.length === 0) {
        return { resultado: 'No se encontraron productos con los filtros indicados.', productos: [] };
    }

    return { resultado: `Se encontraron ${rows.length} producto(s).`, productos: rows };
}

/**
 * Obtiene las especificaciones técnicas de un producto por su ID.
 */
async function obtener_especificaciones({ id_producto }) {
    const sql = `
        SELECT
            p.id,
            p.marca,
            p.modelo,
            p.descripcion,
            p.garantia,
            e.especificacion,
            e.valor
        FROM productos p
        LEFT JOIN especificaciones e ON e.id_producto = p.id
        WHERE p.id = ?
        ORDER BY e.especificacion
    `;
    const [rows] = await pool.query(sql, [id_producto]);

    if (rows.length === 0) {
        return { resultado: 'No se encontró el producto con el ID indicado.', especificaciones: [] };
    }

    const producto = {
        id: rows[0].id,
        marca: rows[0].marca,
        modelo: rows[0].modelo,
        descripcion: rows[0].descripcion,
        garantia_meses: rows[0].garantia,
        especificaciones: rows
            .filter(r => r.especificacion !== null)
            .map(r => ({ especificacion: r.especificacion, valor: r.valor }))
    };

    return { resultado: 'Especificaciones obtenidas correctamente.', producto };
}

/**
 * Registra en la tabla 'consultados' que un producto fue consultado.
 */
async function registrar_consulta({ id_producto }) {
    const sql = `
        INSERT INTO consultados (id_producto, fechahora)
        VALUES (?, NOW())
    `;
    const [result] = await pool.query(sql, [id_producto]);

    return {
        resultado: 'Consulta registrada exitosamente.',
        id_consulta: result.insertId,
        id_producto
    };
}

/**
 * Consulta el precio y el método de pago de un producto.
 */
async function consultar_precio_y_pago({ id_producto }) {
    const sql = `
        SELECT
            id,
            marca,
            modelo,
            precio,
            metodo_pago,
            disponible
        FROM productos
        WHERE id = ?
    `;
    const [rows] = await pool.query(sql, [id_producto]);

    if (rows.length === 0) {
        return { resultado: 'No se encontró el producto con el ID indicado.' };
    }

    return {
        resultado: 'Información de precio y pago obtenida.',
        producto: rows[0]
    };
}

/**
 * Verifica la disponibilidad y el stock de un producto.
 */
async function verificar_stock({ id_producto }) {
    const sql = `
        SELECT
            id,
            marca,
            modelo,
            stock,
            disponible
        FROM productos
        WHERE id = ?
    `;
    const [rows] = await pool.query(sql, [id_producto]);

    if (rows.length === 0) {
        return { resultado: 'No se encontró el producto con el ID indicado.' };
    }

    const p = rows[0];
    const mensaje = p.disponible && p.stock > 0
        ? `El producto está disponible. Hay ${p.stock} unidad(es) en stock.`
        : 'El producto no está disponible actualmente o no tiene stock.';

    return {
        resultado: mensaje,
        disponible: p.disponible,
        stock: p.stock,
        marca: p.marca,
        modelo: p.modelo
    };
}

/**
 * Obtiene los productos más consultados.
 */
async function obtener_productos_mas_consultados({ limite = 5 }) {
    const sql = `
        SELECT
            p.id,
            p.categoria,
            p.marca,
            p.modelo,
            p.precio,
            COUNT(c.id) AS total_consultas
        FROM productos p
        INNER JOIN consultados c ON c.id_producto = p.id
        GROUP BY p.id, p.categoria, p.marca, p.modelo, p.precio
        ORDER BY total_consultas DESC
        LIMIT ?
    `;
    const [rows] = await pool.query(sql, [Number(limite)]);

    if (rows.length === 0) {
        return { resultado: 'No hay registros de consultas aún.', productos: [] };
    }

    return {
        resultado: `Top ${rows.length} producto(s) más consultado(s).`,
        productos: rows
    };
}

// Mapa de herramientas disponibles
const toolHandlers = {
    buscar_productos,
    obtener_especificaciones,
    registrar_consulta,
    consultar_precio_y_pago,
    verificar_stock,
    obtener_productos_mas_consultados
};

/**
 * Ejecuta el handler correspondiente a la herramienta solicitada.
 * @param {string} name  - Nombre de la función
 * @param {object} args  - Argumentos parseados del tool call
 * @returns {Promise<string>} - JSON string con el resultado
 */
async function ejecutarTool(name, args) {
    const handler = toolHandlers[name];
    if (!handler) {
        return JSON.stringify({ error: `Herramienta desconocida: ${name}` });
    }
    try {
        const result = await handler(args);
        return JSON.stringify(result);
    } catch (err) {
        return JSON.stringify({ error: `Error al ejecutar la herramienta ${name}: ${err.message}` });
    }
}

module.exports = { ejecutarTool };
