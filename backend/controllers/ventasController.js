const ventasModel = require('../models/ventasModel');
const productosModel = require('../models/productosModel');
const movimientosModel = require('../models/MovimientosModal');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

exports.createVenta = async (req, res) => {
    try {
        const {estado, detalle } = req.body;
        const usuario_id = req.user.id;
        const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');

        if ( !estado || !detalle || !Array.isArray(detalle) || detalle.length === 0 ) {
            return res.status(400).json({ message: 'Datos inválidos' });
        }

        for (const item of detalle) {
            const producto = await productosModel.getProductoById(item.producto_id);
            if (!producto){
                return res.status(400).json({ message: 'Producto no encontrado' });
            }
            if (Number(item.cantidad) > producto.stock){
                return res.status(400).json({ message: 'Cantidad excede el stock del producto' });
            }
        }

        const total = detalle.reduce((sum, item) => {
            return sum + (Number(item.precio_unitario) * Number(item.cantidad));
        }, 0);

        const venta_id = await ventasModel.createVenta({usuario_id, fecha, total: total.toFixed(2), estado });

        for (const item of detalle) {
            const { producto_id, cantidad, precio_unitario } = item;
            const subtotal = (Number(precio_unitario) * Number(cantidad)).toFixed(2);

            await ventasModel.createDetalleVenta({ venta_id, producto_id, cantidad: Number(cantidad), precio_unitario: Number(precio_unitario), subtotal });

            const producto = await productosModel.getProductoById(Number(producto_id));
            const nuevoStock = producto.stock - Number(cantidad);
            await productosModel.updateStock(producto_id, nuevoStock);

            await movimientosModel.createMovimiento({ usuario_id, producto_id, tipo: 'salida', cantidad: Number(cantidad), fecha, motivo: 'Venta de ' + producto.nombre });
        }

        res.json({ message: 'Venta creada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear la venta' });
    }
}

exports.getVenta = async (req, res) => {
    try {
        const data = await ventasModel.getVentas();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al conectar con la base de datos' });
    }
}

exports.getDetalleVenta = async (req, res) => {
    try {
        const {id} = req.params;

        const venta = await ventasModel.getVentaById(id);

        const detalle = await ventasModel.getDetalleVenta(id);

        if (!venta) return res.status(404).json({ message: 'Venta no encontrada' });

        res.json({ venta, detalle });
    } catch (error) {
        res.status(500).json({ message: 'Error al conectar con la base de datos' });
    }
}

exports.deleteVenta = async (req, res) => {
    try {
        const { id } = req.params;

        const venta = await ventasModel.getVentaById(id);

        if (!venta) return res.status(404).json({ message: 'Venta no encontrada' });

        await ventasModel.deleteVenta(id);
        res.json({ message: 'Venta eliminada' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la venta' });
    }
}

exports.updateVenta = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const venta = await ventasModel.getVentaById(id);

        if (!venta) return res.status(404).json({ message: 'Venta no encontrada' });

        await ventasModel.updateVenta(id, { estado });

        res.json({ message: 'Venta actualizada' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la venta' });
    }
}

exports.getPdfVentas = async (req, res) => {
    try {
        const { id } = req.params;
        const venta = await ventasModel.getVentaById(id);
        const detalle = await ventasModel.getDetalleVenta(id);

        if (!venta) return res.status(404).json({ message: 'Venta no encontrada' });

        const PDFDocument = require('pdfkit');
        const path = require('path');
        const doc = new PDFDocument({ margin: 40, size: 'A4' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=ventas.pdf');
        doc.pipe(res);

        const COLOR_PRIMARY   = '#1a237e';
        const COLOR_ACCENT    = '#3949ab';
        const COLOR_SECONDARY = '#e8eaf6';
        const COLOR_TEXT      = '#212121';
        const COLOR_MUTED     = '#757575';
        const COLOR_WHITE     = '#ffffff';
        const COLOR_BORDER    = '#c5cae9';

        const PAGE_W = doc.page.width;
        const PAGE_H = doc.page.height;
        const MARGIN = 40;
        const CONTENT_W = PAGE_W - MARGIN * 2;

        doc.rect(0, 0, PAGE_W, 90).fill(COLOR_PRIMARY);

        doc.fillColor(COLOR_WHITE).fontSize(22).font('Helvetica-Bold').text('EL TEMPLO FASHOW S.A.', MARGIN, 18, { width: CONTENT_W * 0.6 });

        doc.fillColor('#c5cae9').fontSize(10).font('Helvetica').text('RUC: 0912345678001 | Latacunga, Ecuador', MARGIN, 44);

        const fecha = new Date().toLocaleDateString('es-EC', {
            day: '2-digit', month: 'long', year: 'numeric'
        });
        doc.fillColor(COLOR_WHITE).fontSize(9).text(`Fecha: ${fecha}`, MARGIN, 22, { width: CONTENT_W, align: 'right' });

        doc.fillColor('#c5cae9').fontSize(9).text('Orden de venta', MARGIN, 36, { width: CONTENT_W, align: 'right' });

        doc.rect(0, 90, PAGE_W, 36).fill(COLOR_ACCENT);
        doc.fillColor(COLOR_WHITE).fontSize(14).font('Helvetica-Bold').text('DETALLE DE VENTA', MARGIN, 100, { width: CONTENT_W, align: 'center' });

        const estadoColor = venta.estado ==='completado' ? '#43a047' : venta.estado === 'pendiente' ? '#fb8c00' : '#e53935';

        doc.rect(PAGE_W - MARGIN - 80, 136, 70, 22).fill(estadoColor);
        doc.fillColor(COLOR_WHITE).fontSize(9).font('Helvetica-Bold').text(venta.estado.toUpperCase(), PAGE_W - MARGIN - 80, 142, { width: 80, align: 'center' });

        let startY = 175;

        const cardW = (CONTENT_W - 6) / 3;

        const infoCards = [
            { label: 'Usuario', value: venta.usuarioNombre, sub: 'Responsable' },
            { label: 'Fecha', value: new Date(venta.fecha).toLocaleDateString('es-EC', { day: '2-digit', month: 'long', year: 'numeric' }) },
        ];

        infoCards.forEach((card, i) => {
            const x = MARGIN + i * (cardW + 3);
            doc.rect(x, startY, cardW, 52).fill(COLOR_SECONDARY);
            doc.rect(x, startY, cardW, 4).fill(COLOR_ACCENT);
            doc.fillColor(COLOR_MUTED).fontSize(8).font('Helvetica').text(card.label.toUpperCase(), x + 6, startY + 10, { width: cardW - 12 });
            doc.fillColor(COLOR_PRIMARY).fontSize(16).font('Helvetica-Bold').text(card.value, x + 6, startY + 22, { width: cardW - 12 });
            doc.fillColor(COLOR_MUTED).fontSize(8).font('Helvetica').text(card.sub, x + 6, startY + 38, { width: cardW - 12 });
        });

        startY += 68;

        const cols = [
            { label: '#',      width: 30  },
            { label: 'Producto', width: 200 },
            { label: 'Precio Unit', width: 90 },
            { label: 'Cantidad', width: 80 },
            { label: 'Subtotal', width: 85 },
        ];

        const rowH = 22;

        let x = MARGIN;
        doc.rect(MARGIN, startY, CONTENT_W, rowH).fill(COLOR_ACCENT);
        cols.forEach(col => {
            doc.fillColor(COLOR_WHITE).fontSize(9).font('Helvetica-Bold').text(col.label, x + 5, startY + 8, { width: col.width - 10 });
            x += col.width;
        });

        let y = startY + rowH;
        let tableStartY = startY;

        detalle.forEach((item, index) => {
            if (y + rowH > PAGE_H - 60) {
                doc.rect(MARGIN, tableStartY, CONTENT_W, y - tableStartY).strokeColor(COLOR_BORDER).lineWidth(1).stroke();
                dibujarFooterVenta(doc, PAGE_W, PAGE_H, MARGIN, CONTENT_W, COLOR_PRIMARY);
                x = MARGIN;
                doc.rect(MARGIN, 40, CONTENT_W, rowH).fill(COLOR_ACCENT);
                cols.forEach(col => {
                    doc.fillColor(COLOR_WHITE).fontSize(9).font('Helvetica-Bold').text(col.label, x + 5, 40 + 8, { width: col.width - 10 });
                    x += col.width;
                });
                y = 40 + rowH;
                tableStartY = 40;
            }
            const bgColor = index % 2 === 0 ? COLOR_WHITE : COLOR_SECONDARY;
            doc.rect(MARGIN, y, CONTENT_W, rowH).fill(bgColor);
            doc.moveTo(MARGIN, y + rowH).lineTo(MARGIN + CONTENT_W, y + rowH).strokeColor(COLOR_BORDER).lineWidth(0.5).stroke();

            const filaData = [
                String(index + 1),
                item.productoNombre || '',
                `$${Number(item.precio_unitario).toFixed(2)}`,
                String(item.cantidad),
                `$${Number(item.subtotal).toFixed(2)}`,
            ];

            x = MARGIN;
            cols.forEach((col, ci) => {
                const isSubtotal = ci === 4;
                doc.fillColor(isSubtotal ? COLOR_ACCENT : COLOR_TEXT)
                   .fontSize(9)
                   .font(isSubtotal ? 'Helvetica-Bold' : 'Helvetica')
                   .text(filaData[ci], x + 5, y + 8, { width: col.width - 10 });
                x += col.width;
            });

            y += rowH;
        });

        doc.rect(MARGIN, y, CONTENT_W, 30).fill(COLOR_ACCENT);
        doc.fillColor(COLOR_WHITE).fontSize(12).font('Helvetica-Bold').text(`TOTAL: $${Number(venta.total).toFixed(2)}, MARCA`, MARGIN + 10, y + 9, { width: CONTENT_W - 20 });

        doc.end();
    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Error al generar el PDF' });
        }
    }
};

function dibujarFooterVenta(doc, pageW, pageH, margin, contentW, colorPrimary) {
    doc.rect(0, pageH -40, pageW, 40).fill(colorPrimary);
    doc.fillColor('#ffffff').fontSize(8).font('Helvetica').text('© 2025 COMODIDAD A LA VISTA S.A. — Documento generado automáticamente. Confidencial.', margin, pageH - 30, { width: contentW, align: 'center' });
    
}