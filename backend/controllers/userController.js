const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');

exports.getUsers = async (req, res) => {
    try {
        const data = await userModel.getUsers();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error al conectar con la base de datos' });
    }
}

exports.createUser = async (req, res) => {
    try {
        const { username, password, rol_id } = req.body;

        if (!username || !password || !rol_id) {
            return res.status(400).json({ message: 'Faltan datos' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await userModel.createUser({ username, password: hashedPassword, rol_id });
        await userModel.invalidateTokensByRol(rol_id);

        res.status(201).json({ message: 'Usuario creado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el usuario' });
    }
}

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, password, rol_id } = req.body;

        let hashedPassword = null;

        if (password && password.trim() !== '') {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        await userModel.updateUser(id, {
            username,
            password: hashedPassword,
            rol_id
        });

        res.json({ message: 'Usuario actualizado' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        await userModel.deleteUser(id);
        

        res.json({ message: 'Usuario eliminado' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar' });
    }
};