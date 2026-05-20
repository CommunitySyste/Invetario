const categoriaModel = require('../models/categoriaModel');

exports.getCategorias = async (req, res) => {
    try {
        const data = await categoriaModel.getCategorias();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error al conectar con la base de datos' });
    }
}

exports.createCategoria = async (req, res) => {
    try {
        const { nombre, color, icono, descripcion } = req.body;

        await categoriaModel.createCategoria({ nombre, color, icono, descripcion });
        res.json({ message: 'Categoria creada' });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear la categoria' });
    }
}

exports.updateCategoria = async (req, res) => {
    try {
        const { id, nombre, color, icono, descripcion, created_at } = req.body;

        await categoriaModel.updateCategoria(id, { nombre, color, icono, descripcion, created_at });
        res.json({ message: 'Categoria actualizada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar la categoria' });
    }
}

exports.deleteCategoria = async (req, res) => {
    try {
        const { id } = req.params;

        await categoriaModel.deleteCategoria(id);
        res.json({ message: 'Categoria eliminada' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la categoria' });
    }
}