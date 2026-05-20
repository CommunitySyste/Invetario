const dashboardModel = require('../models/indexModel');

exports.getDashboard = async (req, res) => {
    try {
        const [
            resumen,
            ventasPorMes,
            comprasPorMes,
            topProductos,
            ultimasVentas,
            ultimasCompras
        ] = await Promise.all([
            dashboardModel.getResumenGeneral(),
            dashboardModel.getVentasPorMes(),
            dashboardModel.getComprasPorMes(),
            dashboardModel.getTopProductosVendidos(),
            dashboardModel.getUltimasVentas(),
            dashboardModel.getUltimasCompras()
        ]);

        res.json({
            resumen,
            ventasPorMes,
            comprasPorMes,
            topProductos,
            ultimasVentas,
            ultimasCompras
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el dashboard' });
    }
};