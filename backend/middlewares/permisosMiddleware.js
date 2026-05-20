const verificarAcceso = require('../helpers/permisosHelper');

const checkPermiso = (ruta) => {
    return async (req, res, next) => {
        const user = req.user;

        let accion = 'ver';

        switch (req.method) {
            case 'POST':
                accion = 'crear';
                break;
            case 'PUT':
                accion = 'editar';
                break;
            case 'DELETE':
                accion = 'eliminar';
                break;
        }

        const tienePermiso = await verificarAcceso(user, ruta, accion);

        if (!tienePermiso) {
            return res.status(403).json({ message: 'No tienes permisos para acceder a esta ruta' });
        }
        next();
    }
}

module.exports = checkPermiso;