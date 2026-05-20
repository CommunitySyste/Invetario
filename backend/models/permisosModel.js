const db = require('../db/db');

exports.getSubmenusDisponibles = async (rol_id) => {
    const [row] = await db.query(`SELECT s.id, s.nombre, s.ruta FROM submenus s WHERE s.id NOT IN (SELECT submenu_id FROM permisos WHERE rol_id = ?)`, [rol_id]);
    return row;
};

exports.getPermisosByRol = async (rol_id) => {
    const [rows] = await db.query(`SELECT p.id, s.id AS submenu_id, s.nombre, p.puede_ver, p.puede_editar, p.puede_eliminar, p.puede_crear FROM permisos p JOIN submenus s ON s.id = p.submenu_id WHERE p.rol_id = ?`, [rol_id]);
    return rows;
};

exports.asignarPermisos = async (rol_id, submenu_id) => {
    const [rows] = await db.query(`INSERT INTO permisos (rol_id, submenu_id, puede_ver, puede_editar, puede_eliminar, puede_crear) VALUES (?, ?, ?, ?, ?, ?)`, [rol_id, submenu_id, 1, 1, 1, 1]);
    if (rows.length === 0) {
        return res.status(200).json({ message: 'Este permiso ya existe' });
    }
    return rows;
};

exports.updatePermiso = async (id, data) => {
    const { puede_ver, puede_editar, puede_eliminar, puede_crear } = data;
    const [rows] = await db.query(`UPDATE permisos SET puede_ver = ?, puede_editar = ?, puede_eliminar = ?, puede_crear = ? WHERE id = ?`, [puede_ver, puede_editar, puede_eliminar, puede_crear, id]);
    return rows;
};

exports.deletePermiso = async (id) => {
    const [rows] = await db.query(`DELETE FROM permisos WHERE id = ?`, [id]);
    return rows;
};

exports.getPermisoById = async (id) => {
    const [row] = await db.query(`SELECT * FROM permisos WHERE id = ?`, [id]);
    return row;
};