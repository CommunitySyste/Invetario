const db = require('../db/db');

exports.getProveedores = async () => {
    const [rows] = await db.query(`SELECT * FROM proveedores`);
    return rows;
}

exports.createProveedor = async (data) => {
    const [rows] = await db.query(`INSERT INTO proveedores (nombre, empresa, telefono, email, direccion) VALUES (?, ?, ?, ?, ?)`, [data.nombre, data.empresa, data.telefono, data.email, data.direccion]);
    return rows;
}

exports.updateProveedor = async (id, data) => {
    const { nombre, empresa, telefono, email, direccion, estado } = data;

    let query = `UPDATE proveedores SET nombre = ?, empresa = ?, telefono = ?, email = ?, direccion = ?, estado = ? WHERE id = ?`;

    const params = [nombre, empresa, telefono, email, direccion, estado, id];

    await db.query(query, params);

    return true;
}

exports.deleteProveedor = async (id) => {
    const [rows] = await db.query(`DELETE FROM proveedores WHERE id = ?`, [id]);
    return rows;
}

