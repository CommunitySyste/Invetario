const db = require('../db/db');

exports.getCategorias = async () => {
    const [rows] = await db.query(`SELECT c.id, c.nombre, c.descripcion, c.color, c.created_at, c.icono, COUNT(p.id)  AS total_productos FROM categoria c LEFT JOIN  productos p ON p.categoria_id = c.id GROUP BY c.id ORDER BY c.nombre ASC`);
    return rows;
}

exports.createCategoria = async (data) => {
    const [rows] = await db.query(`INSERT INTO categoria (nombre, color, descripcion, icono, created_at) VALUES (?, ?, ?, ?, NOW())`, [data.nombre, data.color, data.descripcion, data.icono, data.created_at]);
    return rows;
}

exports.updateCategoria = async (id, data) => {
    const [rows] = await db.query(`UPDATE categoria SET nombre = ?, color = ? , descripcion = ?, icono = ? WHERE id = ?`, [data.nombre, data.color, data.descripcion, data.icono, id]);
    return rows;
}

exports.deleteCategoria = async (id) => {
    const [rows] = await db.query(`DELETE FROM categoria WHERE id = ?`, [id]);
    return rows;
}