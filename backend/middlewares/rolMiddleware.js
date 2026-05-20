const db = require('../db/db');

const checkRole = (rutaPermitida) => {
    return async (req, res, next) => {
        try {
            const user = req.user;

            // Superadmin
            if (user.rol_id === 1) {
                return next();
            }

            const query = `
                SELECT p.id
                FROM permisos p
                JOIN submenus s ON p.submenu_id = s.id
                WHERE p.rol_id = ?
                AND s.ruta = ?
                AND p.puede_ver = 1
            `;

            const [rows] = await db.query(query, [
                user.rol_id,
                rutaPermitida
            ]);

            if (rows.length === 0) {
                return res.status(401).json({
                    message: 'No tienes permisos'
                });
            }

            next();

        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: 'Error en permisos'
            });
        }
    };
};

module.exports = checkRole;