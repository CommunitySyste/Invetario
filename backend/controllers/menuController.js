const menuModel = require('../models/menuModel');

exports.getMenu = async (req, res) => {
    try {
        const data = await menuModel.getMenus();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error al conectar con la base de datos' });
    }
}

exports.createMenu = async (req, res) => {
    try {
        const { nombre, icono } = req.body;
        await menuModel.createMenu({ nombre, icono });
        res.json({ message: 'Menu creado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el menu' });
    }
}

exports.updateMenu = async (req, res) => {
    try {
        const { id, nombre, icono } = req.body;
        await menuModel.updateMenu(id, nombre, icono);
        res.json({ message: 'Menu actualizado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el menu' });
    }
}

exports.deleteMenu = async (req, res) => {
    try {
        const { id } = req.params;
        await menuModel.deleteMenu(id);
        res.json({ message: 'Menu eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el menu' });
    }
}