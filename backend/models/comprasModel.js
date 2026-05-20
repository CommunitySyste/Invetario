const db = require('../db/db');

exports.createCompra = async (data) => {
    const [rows] = await db.query(`INSERT INTO compras (proveedor_id, usuario_id, fecha, total, estado) VALUES (?, ?, ?, ?, ?)`, [data.proveedor_id, data.usuario_id, data.fecha, data.total, data.estado]);
    return rows.insertId;
}

exports.createDetalleCompra = async (data) => {
    const [rows] = await db.query(`INSERT INTO detalle_compras (compra_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)`, [data.compra_id, data.producto_id, data.cantidad, data.precio_unitario, data.subtotal]);
    return rows.insertId;
}

exports.updateCompra = async (id, data) => {
    const { estado } = data;

    let query = `UPDATE compras SET estado = ? WHERE id = ?`;

    const params = [estado, id];

    await db.query(query, params);

    return true;
}

exports.getCompras = async () => {
    const [rows] = await db.query(`SELECT c.*, p.nombre AS proveedorNombre, p.empresa  AS proveedorEmpresa, u.username AS usuarioNombre FROM compras c INNER JOIN proveedores p ON c.proveedor_id = p.id INNER JOIN usuarios u ON c.usuario_id = u.id ORDER BY c.created_at DESC`);
    return rows;
}

exports.getCompraById = async (id) => {
    const [rows] = await db.query(`SELECT c.*, p.nombre AS proveedorNombre, p.empresa  AS proveedorEmpresa, u.username AS usuarioNombre FROM compras c INNER JOIN proveedores p ON c.proveedor_id = p.id INNER JOIN usuarios u ON c.usuario_id = u.id WHERE c.id = ?`, [id]);
    return rows[0];
}

exports.getDetalleCompra = async (compra_id) => {
    const [rows] = await db.query(`SELECT dc.*, pr.nombre AS productoNombre, pr.precio AS precioActual FROM detalle_compras dc INNER JOIN productos pr ON dc.producto_id = pr.id WHERE dc.compra_id = ?`, [compra_id]);
    return rows;
}

exports.deleteCompra = async (id) => {
    const [rows] = await db.query(`DELETE FROM compras WHERE id = ?`, [id]);
    return rows;
}