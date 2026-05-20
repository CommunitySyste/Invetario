const jwt = require('jsonwebtoken');
const db = require('../db/db');

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ message: 'No se ha proporcionado un token válido' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'token válido invalido' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const [rows] = await db.query('SELECT id, rol_id, token_version FROM usuarios WHERE id = ?', [decoded.id]);
        
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Usuario no valido' });
        }

        if (decoded.version !== rows[0].token_version) {
            return res.status(401).json({ message: 'Token expirado' });
        }
        req.user = { ...decoded, ...rows[0] };
next();
    } catch (error) {
        res.status(401).json({ message: 'token válido invalido' });
    }
};

module.exports = verifyToken;