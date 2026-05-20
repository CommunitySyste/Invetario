const db = require('../db/db');

async function verificarAcceso(user, ruta, accion = 'ver'){
    try {
        if (user.rol_id === 1){
            return true;
        }

        const query = `SELECT p.puede_ver, p.puede_editar, p.puede_eliminar FROM permisos p INNER JOIN submenus s ON p.submenu_id = s.id WHERE p.rol_id = ? AND s.ruta = ?`;

        const [rows] = await db.query(query, [user.rol_id, ruta]);

        if (!rows.length) return false;

        const permiso = rows[0];

        switch (accion) {
            case 'ver':
                return permiso.puede_ver === 1;
            case 'crear':
                return permiso.puede_crear === 1;
            case 'editar':
                return permiso.puede_editar === 1;
            case 'eliminar':
                return permiso.puede_eliminar === 1;
            default:
                return false;
        }
    } catch (error) {
        console.error('Error en el verificarAcceso:', error);
        throw error;
    }
}

module.exports = verificarAcceso;