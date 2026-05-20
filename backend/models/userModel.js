const db = require('../db/db');

exports.findUserByUsername = async (username) => {
    const [rows] = await db.query(`SELECT u.id, u.username, u.password, u.token_version, r.nombre AS rol, r.color AS color, r.id AS rol_id FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE u.username = ? LIMIT 1`, [username]);
    return rows;
};

exports.invalidateTokensByRol = async (rol_id) => {
    await db.query(`UPDATE usuarios SET token_version = token_version + 1 WHERE rol_id = ?`, [rol_id]);
};

exports.getUsers = async () => {
    const [rows] = await db.query(`SELECT u.id, u.username, r.nombre AS rol, u.rol_id, r.color FROM usuarios u JOIN roles r ON u.rol_id = r.id ORDER BY u.id ASC`);
    return rows;
}

exports.createUser = async (data) => {
    const [rows] = await db.query(`INSERT INTO usuarios (username, password, rol_id) VALUES (?, ?, ?)`, [data.username, data.password, data.rol_id]);
    return rows;
}

exports.updateUser = async (id, data) => {
    const { password, rol_id, username } = data;

    let query = `UPDATE usuarios SET username = ?, rol_id = ?`;
    let params = [username, rol_id];

    if (password) {
        query += `, password = ?`;
        params.push(password);
    }

    query += ` WHERE id = ?`;
    params.push(id);

    await db.query(query, params);

    return true;
}

exports.deleteUser = async (id) => {
    await db.query(`DELETE FROM usuarios WHERE id = ?`, [id]);
    return true;
}