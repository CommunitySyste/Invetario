const db = require('../db/db');

exports.createVenta = async (data) => {
    const [rows] = await db.query(`INSERT INTO ventas (usuario_id, fecha, total, estado) VALUES (?, ?, ?, ?)`, [data.usuario_id, data.fecha, data.total, data.estado]);
    return rows.insertId;
}

exports.createDetalleVenta = async (data) => {
    const [rows] = await db.query(`INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)`, [data.venta_id, data.producto_id, data.cantidad, data.precio_unitario, data.subtotal]);
    return rows.insertId;
}

exports.updateVenta = async (id, data) => {
    const { estado } = data;

    let query = `UPDATE ventas SET estado = ? WHERE id = ?`;

    const params = [estado, id];

    await db.query(query, params);

    return true;
}

exports.getVentas = async () => {
    const [rows] = await db.query(`SELECT v.*, username AS usuarioNombre FROM ventas v INNER JOIN usuarios u ON v.usuario_id = u.id ORDER BY v.created_at DESC`);
    return rows;
}

exports.getVentaById = async (id) => {
    const [rows] = await db.query(`SELECT v.*, username AS usuarioNombre FROM ventas v INNER JOIN usuarios u ON v.usuario_id = u.id WHERE v.id = ?`, [id]);
    return rows[0];
}

exports.getDetalleVenta = async (venta_id) => {
    const [rows] = await db.query(`SELECT dv.*, pr.nombre AS productoNombre, pr.precio AS precioActual, pr.imagen AS imagenProducto FROM detalle_ventas dv INNER JOIN productos pr ON dv.producto_id = pr.id WHERE dv.venta_id = ?`, [venta_id]);
    return rows;
}

exports.deleteVenta = async (id) => {
    const [rows] = await db.query(`DELETE FROM ventas WHERE id = ?`, [id]);
    return rows;
}