const userModel = require('../models/userModel');
const MenuAdmin = require('../Libraries/MenuAdmin');
const db = require('../db/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const users = await userModel.findUserByUsername(username);

        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        const menus = await new MenuAdmin().createMenu(user.id, user.rol_id);

       let permisos = [];

if (user.rol_id === 1) {
    // 🔥 SUPERADMIN → acceso total
    const [allSubmenus] = await db.query(`
        SELECT ruta FROM submenus
    `);

    permisos = allSubmenus.map(sub => ({
        ruta: sub.ruta,
        puede_crear: 1,
        puede_ver: 1,
        puede_editar: 1,
        puede_eliminar: 1
    }));

} else {
    const [rows] = await db.query(`
        SELECT s.ruta, p.puede_crear, p.puede_ver, p.puede_editar, p.puede_eliminar
        FROM permisos p
        JOIN submenus s ON s.id = p.submenu_id
        WHERE p.rol_id = ?
    `, [user.rol_id]);

    permisos = rows;
}
        const token = jwt.sign({ id: user.id, username:user.username, rol:user.rol, rolid: user.rol_id, version:user.token_version }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({token, user: { rolid: user.rol_id, username: user.username, rolusuario: user.rol, color: user.color}, menus, permisos});
    } catch (error) {
        console.error('Error al autenticar:', error);
        res.status(500).json({ message: 'Error al autenticar' });
    }
};