const db = require('../db/db');

exports.getRoles = async () => {
    const [rows] = await db.query(`SELECT * FROM roles`);
    return rows;
}

exports.createRoles = async (nombre, color) => {
    const [rows] = await db.query(`INSERT INTO roles (nombre, color) VALUES (?, ?)`, [nombre, color]);
    return rows;
}

exports.updateRoles = async (id, nombre, color) => {
    const [rows] = await db.query(`UPDATE roles SET nombre = ?, color = ? WHERE id = ?`, [nombre, color, id]);
    return rows;
}

exports.deleteRoles = async (id) => {
    const [rows] = await db.query(`DELETE FROM roles WHERE id = ?`, [id]);
    return rows;
}