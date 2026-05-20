const db = require('../db/db');

exports.getSubmenusByMenu = async (id) => {
    const [rows] = await db.query(`SELECT * FROM submenus WHERE menu_id = ?`, [id]);
    return rows;
}

exports.createSubmenu = async (data) => {
    const [rows] = await db.query(`INSERT INTO submenus (nombre, icono, ruta, menu_id) VALUES (?, ?, ?, ?)`, [data.nombre, data.icono, data.ruta, data.menu_id]);
    return rows;
}

exports.updateSubmenu = async (id, data) => {
    const [rows] = await db.query(`UPDATE submenus SET nombre = ?, icono = ?, ruta = ? WHERE id = ?`, [data.nombre, data.icono, data.ruta, id]);
    return rows;
}

exports.deleteSubmenu = async (id) => {
    const [rows] = await db.query(`DELETE FROM submenus WHERE id = ?`, [id]);
    return rows;
}