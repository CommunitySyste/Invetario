const subMenuModel = require('../models/subMenusModel');

exports.getSubmenusByMenu = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await subMenuModel.getSubmenusByMenu(id);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error al conectar con la base de datos' });
    }
}

exports.createSubmenu = async (req, res) => {
    try {
        const { nombre, icono, ruta, menu_id } = req.body;
        await subMenuModel.createSubmenu({ nombre, icono, ruta, menu_id });
        res.json({ message: 'Submenu creado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el submenu' });
    }
}

exports.updateSubmenu = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        await subMenuModel.updateSubmenu(id, data);
        res.json({ message: 'Submenu actualizado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el submenu' });
    }
}

exports.deleteSubmenu = async (req, res) => {
    try {
        const { id } = req.params;
        await subMenuModel.deleteSubmenu(id);
        res.json({ message: 'Submenu eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el submenu' });
    }
}