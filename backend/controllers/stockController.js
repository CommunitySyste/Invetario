const stockModel = require('../models/stockModel');

exports.getEstadisticasStock = async (req, res) => {
    try {
        const [general, stockBajo, porCategoria, resumen] = await Promise.all([
            stockModel.getStockGeneral(),
            stockModel.getStockBajo(10),
            stockModel.getStockPorCategoria(),
            stockModel.getResumen()
        ]);

        res.json({ general, stockBajo, porCategoria, resumen });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener estadísticas de stock' });
    }
};