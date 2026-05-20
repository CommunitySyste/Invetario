const proveedorModel = require('../models/proveedoresModel');

exports.getProveedores = async (req, res) => {
    try {
        const data = await proveedorModel.getProveedores();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error al conectar con la base de datos' });
    }
}

exports.createProveedor = async (req, res) => {
    try {
        const { nombre, empresa, telefono, email, direccion, estado } = req.body;

        await proveedorModel.createProveedor({ nombre, empresa, telefono, email, direccion });
        res.json({ message: 'Proveedor creado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el proveedor' });
    }
}

exports.updateProveedor = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, empresa, telefono, email, direccion, estado } = req.body;

        await proveedorModel.updateProveedor(id, { nombre, empresa, telefono, email, direccion, estado });
        res.json({ message: 'Proveedor actualizado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el proveedor' });
    }
}

exports.deleteProveedor = async (req, res) => {
    try {
        const { id } = req.params;

        await proveedorModel.deleteProveedor(id);
        res.json({ message: 'Proveedor eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el proveedor' });
    }
}