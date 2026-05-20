const movimientosModel = require('../models/MovimientosModal');
const productosModel = require('../models/productosModel');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');


exports.createMovimiento = async (req, res) => {
    try {
        const {producto_id, tipo, cantidad, fecha, motivo, usuario_id } = req.body;


        const producto = await productosModel.getProductoById(producto_id);

        if (!producto) {
            return res.status(404).send('Producto no encontrado');
        }

        let nuevoStock = producto.stock;

        if (tipo === 'entrada') {
            nuevoStock += Number(cantidad);
        }

        if (tipo === 'salida') {
            if (cantidad > producto.stock) {
                return res.status(400).json({ message: 'Cantidad Insuficiente' });
            }
            nuevoStock -= Number(cantidad);
        }

        await productosModel.updateStock(producto_id, nuevoStock);

        await movimientosModel.createMovimiento({ usuario_id, producto_id, tipo, cantidad, fecha, motivo });

        res.json({ message: 'Movimiento creado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear el movimiento' });
    }
}

exports.getMovimientos = async (req, res) => {
    try {
        const data = await movimientosModel.getMovimientos();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error al conectar con la base de datos' });
    }
}

exports.getEstadisticasMovimientos = async (req, res) => {
    try {
        const { desde, hasta, tipo } = req.query;

        let where = 'WHERE 1=1 ';
        const params = [];

        if (tipo) { where += ' AND m.tipo = ? '; params.push(tipo); }
        if (desde) { where += ' AND DATE(m.fecha) >= ? '; params.push(desde); }
        if (hasta) { where += ' AND DATE(m.fecha) <= ? '; params.push(hasta); }

        const [movimientos, porTipo, porDia, topProductos] = await Promise.all([
            movimientosModel.getMovimientosByWere(where, params),
            movimientosModel.getPorTipo(where, params),
            movimientosModel.getPorDia(where, params),
            movimientosModel.getTopProductos(where, params),
        ]);

        res.json({ movimientos, porTipo, porDia, topProductos });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener estadísticas' });
    }
};

exports.getPdfMovimientos = async (req, res) => {
    try {
        const movimiento = await movimientosModel.getMovimientoById(req.params.id)
        console.log(movimiento)
        if (!movimiento) return res.status(404).json({ message: 'Movimiento no encontrado' })

        const doc = new PDFDocument({ margin: 40, size: 'A4' })
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `inline; filename=movimiento_${movimiento.id}.pdf`)
        doc.pipe(res)

        doc.fontSize(18).font('Helvetica-Bold').fillColor('#333')
           .text('Comprobante de Movimiento', { align: 'center' })
        doc.fontSize(10).font('Helvetica').fillColor('#666')
           .text(`Generado: ${new Date().toLocaleDateString('es-EC')}`, { align: 'center' })
        doc.moveDown()

        doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor('#cccccc').stroke()
        doc.moveDown()

        const color = movimiento.tipo === 'entrada' ? '#16a34a' : '#dc2626'
        const cantidad = movimiento.tipo === 'entrada' ? `+${movimiento.cantidad}` : `-${movimiento.cantidad}`

        const campo = (label, valor, colorValor = '#111') => {
            doc.fontSize(9).font('Helvetica-Bold').fillColor('#888').text(label, { continued: false })
            doc.fontSize(11).font('Helvetica').fillColor(colorValor).text(valor)
            doc.moveDown(0.5)
        }

        campo('N° Movimiento', `#${movimiento.idMovimiento}`)
        campo('Producto',      movimiento.productoNombre)
        campo('Tipo',          movimiento.tipo)
        campo('Cantidad',      cantidad, color)
        campo('Usuario',       movimiento.usuarioNombre)
        campo('Fecha',         new Date(movimiento.fecha).toLocaleDateString('es-EC', { dateStyle: 'long' }))
        campo('Motivo',        movimiento.motivo || 'Sin motivo')
        
        doc.moveDown()
        doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor('#cccccc').stroke()

        doc.end()

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error al generar el PDF' })
    }
}