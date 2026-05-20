const db = require('../db/db');

exports.getResumenGeneral = async () => {
    const [ventas] = await db.query(`
        SELECT 
            COUNT(*) AS total_ventas,
            SUM(total) AS total_vendido,
            SUM(CASE WHEN estado = 'completado' THEN 1 ELSE 0 END) AS ventas_completadas,
            SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) AS ventas_pendientes
        FROM ventas
    `);

    const [compras] = await db.query(`
        SELECT 
            COUNT(*) AS total_compras,
            SUM(total) AS total_comprado,
            SUM(CASE WHEN estado = 'completado' THEN 1 ELSE 0 END) AS compras_completadas,
            SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) AS compras_pendientes
        FROM compras
    `);

    const [productos] = await db.query(`
        SELECT 
            COUNT(*) AS total_productos,
            SUM(stock) AS total_stock,
            SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) AS sin_stock,
            SUM(CASE WHEN stock <= 10 AND stock > 0 THEN 1 ELSE 0 END) AS stock_bajo
        FROM productos WHERE estado = 'activo'
    `);

    return {
        ventas:   ventas[0],
        compras:  compras[0],
        productos: productos[0]
    };
};

exports.getVentasPorMes = async () => {
    const [rows] = await db.query(`
        SELECT 
            DATE_FORMAT(fecha, '%Y-%m') AS mes,
            SUM(total) AS total,
            COUNT(*) AS cantidad
        FROM ventas
        WHERE fecha >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY mes
        ORDER BY mes ASC
    `);
    return rows;
};

exports.getComprasPorMes = async () => {
    const [rows] = await db.query(`
        SELECT 
            DATE_FORMAT(fecha, '%Y-%m') AS mes,
            SUM(total) AS total,
            COUNT(*) AS cantidad
        FROM compras
        WHERE fecha >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY mes
        ORDER BY mes ASC
    `);
    return rows;
};

exports.getTopProductosVendidos = async () => {
    const [rows] = await db.query(`
        SELECT p.nombre, p.imagen, SUM(dv.cantidad) AS total_vendido,
               SUM(dv.subtotal) AS total_ingresos
        FROM detalle_ventas dv
        INNER JOIN productos p ON p.id = dv.producto_id
        GROUP BY p.id, p.nombre, p.imagen
        ORDER BY total_vendido DESC
        LIMIT 5
    `);
    return rows;
};

exports.getUltimasVentas = async () => {
    const [rows] = await db.query(`
        SELECT v.id, v.total, v.estado, v.fecha, u.username AS usuario
        FROM ventas v
        INNER JOIN usuarios u ON u.id = v.usuario_id
        ORDER BY v.created_at DESC
        LIMIT 5
    `);
    return rows;
};

exports.getUltimasCompras = async () => {
    const [rows] = await db.query(`
        SELECT c.id, c.total, c.estado, c.fecha, 
               p.nombre AS proveedor, p.empresa
        FROM compras c
        INNER JOIN proveedores p ON p.id = c.proveedor_id
        ORDER BY c.created_at DESC
        LIMIT 5
    `);
    return rows;
};