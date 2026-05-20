const db = require('../db/db');

exports.getProductos = async (filtro = {}) => {
    let query = `SELECT p.*, c.nombre AS categoriaNombre FROM productos p INNER JOIN categoria c ON p.categoria_id = c.id WHERE 1 = 1`;

    const params = []

    if (filtro.nombre) {
        query += ` AND p.nombre LIKE ?`;
        params.push(`%${filtro.nombre}%`);
    } 

    if (filtro.categoria_id) {
        query += ` AND p.categoria_id = ?`;
        params.push(filtro.categoria_id);
    }

    query += ` ORDER BY p.nombre DESC`;

    const [rows] = await db.query(query, params);
    return rows;
};

exports.getStatsProductos = async () => {
    const [total] = await db.query(`SELECT COUNT(*) AS total FROM productos`);

    const [stockBajo] = await db.query(`SELECT COUNT(*) AS total FROM productos WHERE stock <= 5`);

    const [mes] = await db.query(`SELECT COUNT(*) AS total FROM productos WHERE MONTH(created_at) =MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())`);

    return { total: total[0].total, stock_bajo: stockBajo[0].total, mes: mes[0].total };
};

exports.createProducto = async (data) => {
    const [rows] = await db.query(`INSERT INTO productos (nombre, categoria_id, stock, precio, imagen, estado, descripcion, created_at, proveedor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [data.nombre, data.categoria_id, data.stock, data.precio, data.imagen, data.estado || 'activo', data.descripcion, data.created_at, data.proveedor_id]);
    return rows;
}

exports.updateProducto = async (id, data) => {
    const { nombre, categoria_id, precio, stock, descripcion, estado, imagen, proveedor_id } = data;

    let query = `UPDATE productos SET nombre = ?, categoria_id = ?, precio = ?, stock = ?, descripcion = ?, estado = ?, proveedor_id = ? `;

    const params = [nombre, categoria_id, precio, stock, descripcion, estado, proveedor_id];

    if (imagen) {
        query += `, imagen = ?`;
        params.push(imagen);
    }

    query += ` WHERE id = ?`;
    params.push(id);

    const [rows] = await db.query(query, params);
    return rows;
}

exports.deleteProducto = async (id) => {
    const [rows] = await db.query(`DELETE FROM productos WHERE id = ?`, [id]);
    return rows;
}

exports.getProductoById = async (id) => {
    const [rows] = await db.query(`SELECT p.*, c.nombre AS categoriaNombre FROM productos p INNER JOIN categoria c ON p.categoria_id = c.id WHERE p.id = ?`, [id]);
    return rows[0];
};

exports.updateStock = async (id, cantidad, tipo) => {
    if (tipo === 'entrada') {
        await db.query(
            `UPDATE productos SET stock = stock + ? WHERE id = ?`,
            [cantidad, id]
        );
    } else if (tipo === 'salida') {
        await db.query(
            `UPDATE productos SET stock = stock - ? WHERE id = ?`,
            [cantidad, id]
        );
    }
};

exports.getProductoByProveedor = async (proveedor_id) => {
    const [rows] = await db.query(`SELECT p.*, c.nombre AS categoriaNombre FROM productos p INNER JOIN categoria c ON p.categoria_id = c.id WHERE p.proveedor_id = ?`, [proveedor_id]);
    return rows;
}

exports.getStats = async () => {
    const [total] = await db.query(`SELECT COUNT(*) AS total FROM productos`);

    const [stockBajo] = await db.query(`SELECT COUNT(*) AS total FROM productos WHERE stock <= 5`);

    const [mes] = await db.query(`SELECT COUNT(*) AS total FROM productos WHERE MONTH(created_at) =MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())`);

    return { total: total[0].total, stock_bajo: stockBajo[0].total, mes: mes[0].total };
}

exports.getByCategoria = async () => {
    const [row] = await db.query(`SELECT c.nombre, c.color, COUNT(p.id) AS total FROM categoria c LEFT JOIN productos p ON p.categoria_id = c.id GROUP BY c.id ORDER BY c.nombre ASC`);
    return row;
}

exports.getByMes = async () => {
    const [row] = await db.query(`SELECT DATE_FORMAT(created_at, '%m-%m') AS mes, COUNT(*) AS total FROM productos WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH) GROUP BY mes ORDER BY mes ASC`);
    return row;
}

exports.getStock = async () => {
    const [row] = await db.query(`SELECT p.nombre, p.stock, c.color FROM productos p INNER JOIN categoria c ON p.categoria_id = c.id ORDER BY p.stock ASC`);
    return row;
}

exports.getStockBajo = async () => {
    const [row] = await db.query(`SELECT p.nombre, p.stock, p.precio, p.estado, c.nombre AS categoriaNombre, pr.nombre AS proveedorNombre FROM productos p INNER JOIN categoria c ON p.categoria_id = c.id INNER JOIN proveedores pr ON p.proveedor_id = pr.id WHERE p.stock <= 5 ORDER BY p.stock ASC`);
    return row;
}