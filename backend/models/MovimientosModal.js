const db = require('../db/db');

exports.createMovimiento = async (data) => {
    const [rows] = await db.query(`INSERT INTO movimientos (usuario_id, producto_id, tipo, cantidad, fecha, motivo) VALUES (?, ?, ?, ?, ?, ?)`, [data.usuario_id, data.producto_id, data.tipo, data.cantidad, data.fecha, data.motivo]);
    return rows;
}

exports.getMovimientos = async (filtro = {}) => {
    const [rows] = await db.query(`SELECT m.*, p.nombre AS productoNombre, u.username AS usuarioNombre FROM movimientos m INNER JOIN productos p ON m.producto_id = p.id INNER JOIN usuarios u ON m.usuario_id = u.id WHERE 1 = 1`, filtro);
    return rows;
}

exports.getMovimientosByWere = async (where, params) => {
    const [row] = await db.query(`SELECT  m.id, p.nombre AS productoNombre, m.tipo, m.cantidad, u.username AS usuarioNombre, m.fecha, m.motivo FROM movimientos m INNER JOIN productos p ON m.producto_id = p.id INNER JOIN usuarios u ON m.usuario_id ${where} ORDER BY m.fecha DESC`, params);
    return row;
}

exports.getPorTipo = async (where, params) => {
    const [rows] = await db.query(`SELECT tipo, SUM(cantidad) as total FROM movimientos m ${where} GROUP BY tipo`, params);
    return rows;
}

exports.getPorDia = async (where, params) => {
    const [rows] = await db.query(`SELECT DATE(m.fecha) as dia, m.tipo, SUM(m.cantidad) as total FROM movimientos m ${where} GROUP BY DATE(m.fecha), m.tipo ORDER BY dia ASC`, params);
    return rows;
}

exports.getTopProductos = async (where, params) => {
    const [rows] = await db.query(`SELECT p.nombre, m.tipo, SUM(m.cantidad) as total FROM movimientos m INNER JOIN productos p ON p.id = m.producto_id ${where} GROUP BY p.nombre, m.tipo ORDER BY total DESC LIMIT 5`, params);
    return rows;
}

exports.getMovimientoById = async (id) => {
    const [row] = await db.query(`SELECT m.id AS idMovimiento, p.nombre AS productoNombre, m.tipo, m.cantidad, u.username AS usuarioNombre, m.fecha, m.motivo FROM movimientos m INNER JOIN productos p ON m.producto_id = p.id INNER JOIN usuarios u ON m.usuario_id = u.id WHERE m.id = ?`, [id]);
    return row[0];
};
