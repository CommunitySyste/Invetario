const db = require('../db/db');

exports.getStockGeneral = async () => {
    const [rows] = await db.query(`SELECT p.id, p.nombre, p.stock, p.precio, c.nombre AS categoriaNombre, pr.nombre AS proveedorNombre, pr.empresa, p.estado, (p.stock * p.precio) AS valor_total FROM productos p LEFT JOIN categoria c ON c.id = p.categoria_id LEFT JOIN proveedores pr ON pr.id = proveedor_id ORDER BY p.Stock ASC`);
    return rows;
}

exports.getStockBajo = async (limite = 10) => {
    const [rows] = await db.query(`SELECT p.nombre, p.stock, c.nombre AS categoriaNombre FROM productos p LEFT JOIN categoria c ON c.id = p.categoria_id WHERE p.stock <= ? AND p.estado = 'activo' ORDER BY p.stock ASC`, [limite]);
    return rows;
}

exports.getStockPorCategoria = async () => {
    const [rows] = await db.query(`SELECT c.nombre AS categoriaNombre, COUNT(p.id) AS total_productos, SUM(p.stock) AS total_stock, SUM(p.stock * p.precio) AS valor_total FROM productos p LEFT JOIN categoria c ON c.id = p.categoria_id GROUP BY c.nombre ORDER BY total_stock DESC`);
    return rows;
}

exports.getResumen = async () => {
    const [rows] = await db.query(`SELECT COUNT(*) AS total_productos, SUM(stock) AS total_stock, SUM(stock * precio) AS valor_inventario, SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END ) AS sin_stock, SUM(CASE WHEN STOCK <= 10 AND stock > 0 THEN 1 ELSE 0 END ) AS stock_bajo, SUM(CASE WHEN STOCK > 10 THEN 1 ELSE 0 END ) AS stock_ok FROM productos WHERE estado = 'activo'`);
    return rows;
}