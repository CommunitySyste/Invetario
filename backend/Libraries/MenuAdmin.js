const db = require('../db/db');

class MenuAdmin {
    async createMenu(userId, rolid) {
        try {
            let menus = [];

            if (rolid === 1) {
                const [rows] = await db.query('SELECT * FROM menus ORDER BY nombre ASC');

                menus = rows;
            } else {
                const  [rows] = await db.query(`SELECT DISTINCT m.id, m.nombre, m.icono FROM menus m INNER JOIN submenus s ON s.menu_id = m.id INNER JOIN permisos p ON p.submenu_id = s.id WHERE p.rol_id = ? AND p.puede_ver = 1 ORDER BY m.nombre ASC`, [rolid]);
                menus = rows;
            }

            const menuData = [];

            for (const menu of menus ){
                const categoria = { 
                    id: menu.id,
                    nombre: menu.nombre,
                    icono: menu.icono,
                    subMenus: []
                };

                let subMenus = [];

                if (rolid === 1) {
                    const [rows] = await db.query(`SELECT s.id, s.nombre, s.ruta, s.icono FROM submenus s WHERE s.menu_id = ? ORDER BY s.nombre ASC`, [menu.id]);
                    subMenus = rows;
                } else {
                    const [rows] = await db.query(`SELECT s.id, s.nombre, s.ruta, s.icono, p.puede_ver, p.puede_editar, p.puede_eliminar, p.puede_crear FROM  submenus s INNER JOIN  permisos p ON p.submenu_id = s.id WHERE s.menu_id = ? AND p.rol_id = ? AND p.puede_ver = 1 ORDER BY s.nombre ASC`, [menu.id, rolid]);
                    subMenus = rows;
                }

                for (const sub of subMenus) {
                    categoria.subMenus.push({
                        id: sub.id,
                        nombre: sub.nombre,
                        ruta: sub.ruta,
                        icono: sub.icono,
                        ...(rolid !==1 && {
                            puedeEditar: sub.puede_editar,
                            puedeEliminar: sub.puede_eliminar,
                            puedeVer: sub.puede_ver
                        })
                    });
                }
                if (categoria.subMenus.length > 0) {
                    menuData.push(categoria);
                }
            }

            return menuData;
        } catch (error) {
            console.error('Error al construir el menú:', error);
            throw error;
        }
    }
}

module.exports = MenuAdmin;