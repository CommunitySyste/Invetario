const db = require('../db/db');

exports.getMenus = async () => {
    const [rows] = await db.query('SELECT * FROM menus ORDER BY nombre ASC');
    return rows;
}

exports.getMenuById = async (id) => {
    const [rows] = await db.query(`SELECT * FROM menus WHERE id = ?`, [id]);
    return rows;
}

exports.createMenu = async (data) => {
    const [rows] = await db.query(`INSERT INTO menus (nombre, icono) VALUES (?, ?)`, [data.nombre, data.icono]);
    return rows;
}

exports.updateMenu = async (id, nombre, icono) => {
    const [rows] = await db.query(`UPDATE menus SET nombre = ?, icono = ? WHERE id = ?`, [nombre, icono, id]);
    return rows;
}

exports.deleteMenu = async (id) => {
    await db.query(`DELETE FROM menus WHERE id = ?`, [id]);
    return true;
}