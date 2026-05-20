const rolModel = require('../models/rolModel');

exports.getRoles = async (req, res) => {
    try {
        const roles = await rolModel.getRoles();
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: 'Error al conectar con la base de datos' });
    }
};

exports.createRoles = async (req, res) => {
    try {
        const { nombre, color } = req.body;

        await rolModel.createRoles(nombre, color);
        res.json({ message: 'Role creada' });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear la role' });
    }
};

exports.updateRoles = async (req, res) => {
    try {
        const { id, nombre, color } = req.body;

        await rolModel.updateRoles(id, nombre, color);
        res.json({ message: 'Role actualizada' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la role' });
    }
}

exports.deleteRoles = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === 1) return res.status(400).json({ message: 'No se puede eliminar el rol Superadministrador' });

        await rolModel.deleteRoles(id);
        res.json({ message: 'Role eliminada' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la role' });
    }
}