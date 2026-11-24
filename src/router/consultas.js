// Router de consultas de verificación (solo GET).
// Permite verificar que los datos se están guardando correctamente en la DB.
// NOTA: Esta lógica es solo de verificación, no es la lógica principal del negocio.

const { Router } = require('express');
const pool = require('../config/db');

const router = Router();

/**
 * GET /api/consultas/productos
 * Lista todos los productos registrados en la base de datos.
 */
router.get('/productos', async (req, res) => {
    const sql = `
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
        ORDER BY id
    `;
    const [rows] = await pool.query(sql);
    return res.status(200).json({ total: rows.length, productos: rows });
});

/**
 * GET /api/consultas/productos/:id
 * Obtiene un producto específico por su ID, incluyendo sus especificaciones.
 */
router.get('/productos/:id', async (req, res) => {
    const { id } = req.params;

    const sqlProducto = `
        SELECT
            p.id,
            p.categoria,
            p.marca,
            p.modelo,
            p.descripcion,
            p.garantia,
            p.stock,
            p.metodo_pago,
            p.precio,
            p.disponible
        FROM productos p
        WHERE p.id = ?
    `;
    const [producto] = await pool.query(sqlProducto, [id]);

    if (producto.length === 0) {
        return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    const sqlEspec = `
        SELECT especificacion, valor
        FROM especificaciones
        WHERE id_producto = ?
        ORDER BY especificacion
    `;
    const [especificaciones] = await pool.query(sqlEspec, [id]);

    return res.status(200).json({
        producto: producto[0],
        especificaciones
    });
});

/**
 * GET /api/consultas/especificaciones
 * Lista todas las especificaciones técnicas registradas.
 */
router.get('/especificaciones', async (req, res) => {
    const sql = `
        SELECT
            e.id,
            e.id_producto,
            p.marca,
            p.modelo,
            e.especificacion,
            e.valor
        FROM especificaciones e
        INNER JOIN productos p ON p.id = e.id_producto
        ORDER BY e.id_producto, e.especificacion
    `;
    const [rows] = await pool.query(sql);
    return res.status(200).json({ total: rows.length, especificaciones: rows });
});

/**
 * GET /api/consultas/consultados
 * Lista todos los registros de productos consultados por los clientes.
 */
router.get('/consultados', async (req, res) => {
    const sql = `
        SELECT
            c.id,
            c.id_producto,
            p.marca,
            p.modelo,
            c.fechahora
        FROM consultados c
        INNER JOIN productos p ON p.id = c.id_producto
        ORDER BY c.fechahora DESC
    `;
    const [rows] = await pool.query(sql);
    return res.status(200).json({ total: rows.length, consultados: rows });
});

/**
 * GET /api/consultas/consultados/ranking
 * Muestra el ranking de productos más consultados con su conteo total.
 */
router.get('/consultados/ranking', async (req, res) => {
    const sql = `
        SELECT
            p.id,
            p.categoria,
            p.marca,
            p.modelo,
            p.precio,
            COUNT(c.id) AS total_consultas
        FROM productos p
        LEFT JOIN consultados c ON c.id_producto = p.id
        GROUP BY p.id, p.categoria, p.marca, p.modelo, p.precio
        ORDER BY total_consultas DESC
    `;
    const [rows] = await pool.query(sql);
    return res.status(200).json({ ranking: rows });
});

/**
 * GET /api/consultas/consultados/producto/:id
 * Lista todas las consultas registradas para un producto específico.
 */
router.get('/consultados/producto/:id', async (req, res) => {
    const { id } = req.params;

    const sqlCheck = 'SELECT id, marca, modelo FROM productos WHERE id = ?';
    const [producto] = await pool.query(sqlCheck, [id]);

    if (producto.length === 0) {
        return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    const sql = `
        SELECT
            c.id,
            c.id_producto,
            c.fechahora
        FROM consultados c
        WHERE c.id_producto = ?
        ORDER BY c.fechahora DESC
    `;
    const [rows] = await pool.query(sql, [id]);

    return res.status(200).json({
        producto: producto[0],
        total_consultas: rows.length,
        consultas: rows
    });
});

module.exports = router;
