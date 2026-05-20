const permisosModel = require('../models/permisosModel');
const userModel = require('../models/userModel');
const db = require('../db/db');

exports.getSubmenusDisponibles = async (req, res) => {
    try {
        const { rol_id } = req.params;

        if (rol_id === 1) {
            return res.status(200).json([]);
        }
        const data = await permisosModel.getSubmenusDisponibles(rol_id);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getPermisosByRol = async (req, res) => {
    try{
        const { rol_id } = req.params;

        if (rol_id === 1) {
            const [rows] = await db.query(`SELECT s.id AS submenu_id, s.nombre, 1 AS puede_ver, 1 AS puede_editar, 1 AS puede_eliminar, 1 AS puede_crear FROM submenus s`);
            res.status(200).json(rows);
        }
        const data = await permisosModel.getPermisosByRol(rol_id);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.asignarPermisos = async (req, res) => {
    try {
        const { rol_id, submenu_id } = req.body;
        if (rol_id === 1) {
            return res.status(200).json({ message: 'No puedes asignar permisos a un rol' });
        }
        await permisosModel.asignarPermisos(rol_id, submenu_id);
        await userModel.invalidateTokensByRol(rol_id);
        res.status(200).json({ message: 'Permisos asignados correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.updatePermiso = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        await permisosModel.updatePermiso(id, data);

        await userModel.invalidateTokensByRol(data.rol_id);

        res.json({ message: 'Permiso actualizado' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

exports.deletePermiso = async (req, res) => {
    try {
        const { id } = req.params;
        if (id === 1) {
            return res.status(200).json({ message: 'No puedes eliminar permisos de un rol', permiso: null });
        }

        const permiso = await permisosModel.getPermisoById(id);
        
        if (!permiso){
            return res.status(404).json({ message: 'Permiso no encontrado' });
        }

        await permisosModel.deletePermiso(id);

        await userModel.invalidateTokensByRol(permiso.rol_id);
        res.status(200).json({ message: 'Permiso eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}