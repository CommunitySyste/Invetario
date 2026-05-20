const comprasModel = require('../models/comprasModel');
const productosModel = require('../models/productosModel');
const movimientosModel = require('../models/MovimientosModal');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

exports.createCompra = async (req, res) => {
    try {
        const { proveedor_id, estado, detalle } = req.body;
        const usuario_id = req.user.id;
        const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');

        if (!proveedor_id  || !estado || !detalle) {
            return res.status(400).json({ message: 'Datos inválidos' });
        }

        const total = detalle.reduce((sum, item) => {
            return sum + (Number(item.precio_unitario) * Number(item.cantidad));
        }, 0);

        const compra_id = await comprasModel.createCompra({ proveedor_id, usuario_id, fecha, total, estado });

        for (const item of detalle) {
            const { producto_id, cantidad, precio_unitario } = item;
            const subtotal = (Number(precio_unitario) * Number(cantidad)).toFixed(2);

            await comprasModel.createDetalleCompra({ compra_id, producto_id, cantidad, precio_unitario, subtotal });

            const producto = await productosModel.getProductoById(producto_id);

            if (!producto) continue;

            const nuevoStock = producto.stock + Number(cantidad);

            await productosModel.updateStock(producto_id, nuevoStock);

            await movimientosModel.createMovimiento({ usuario_id, producto_id, tipo: 'entrada', cantidad, fecha, motivo: 'Compra de ' + producto.nombre });
        }

        res.json({ message: 'Compra creada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear la compra' });
    }
}

exports.getCompra = async (req, res) => {
    try {
        const data = await comprasModel.getCompras();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al conectar con la base de datos' });
    }
}

exports.getDetalleCompra = async (req, res) => {
    try {
        const {id} = req.params;

        const compra = await comprasModel.getCompraById(id);

        const detalle = await comprasModel.getDetalleCompra(id);

        if (!compra) return res.status(404).json({ message: 'Compra no encontrada' });

        res.json({ compra, detalle });
    } catch (error) {
        res.status(500).json({ message: 'Error al conectar con la base de datos' });
    }
}

exports.deleteCompra = async (req, res) => {
    try {
        const { id } = req.params;

        const compra = await comprasModel.getCompraById(id);

        if (!compra) return res.status(404).json({ message: 'Compra no encontrada' });

        await comprasModel.deleteCompra(id);
        res.json({ message: 'Compra eliminada' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la compra' });
    }
}

exports.updateCompra = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const compra = await comprasModel.getCompraById(id);

        if (!compra) return res.status(404).json({ message: 'Compra no encontrada' });

        await comprasModel.updateCompra(id, { estado });

        res.json({ message: 'Compra actualizada' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la compra' });
    }
}

exports.getPdfCompras = async (req, res) => {
    try {
        const { id } = req.params;
        const compra = await comprasModel.getCompraById(id);
        const detalle = await comprasModel.getDetalleCompra(id);

        if (!compra) return res.status(404).json({ message: 'Compra no encontrada' });

        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument({ margin: 40, size: 'A4' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=compras.pdf');
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

        doc.fillColor('#c5cae9').fontSize(9).text('Orden de compra', MARGIN, 36, { width: CONTENT_W, align: 'right' });

        doc.rect(0, 90, PAGE_W, 36).fill(COLOR_ACCENT);
        doc.fillColor(COLOR_WHITE).fontSize(14).font('Helvetica-Bold').text('DETALLE DE COMPRA', MARGIN, 100, { width: CONTENT_W, align: 'center' });

        const estadoColor = compra.estado ==='completado' ? '#43a047' : compra.estado === 'pendiente' ? '#fb8c00' : '#e53935';

        doc.rect(PAGE_W - MARGIN - 80, 136, 70, 22).fill(estadoColor);
        doc.fillColor(COLOR_WHITE).fontSize(9).font('Helvetica-Bold').text(compra.estado.toUpperCase(), PAGE_W - MARGIN - 80, 142, { width: 80, align: 'center' });

        let startY = 175;

        const cardW = (CONTENT_W - 6) / 3;

        const infoCards = [
            { label: 'Proveedor', value: compra.proveedorEmpresa, sub: compra.proveedorNombre },
            { label: 'Usuario', value: compra.usuarioNombre, sub: 'Responsable' },
            { label: 'Fecha', value: new Date(compra.fecha).toLocaleDateString('es-EC', { day: '2-digit', month: 'long', year: 'numeric' }) },
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
            {label: '#',      width: 30  },
            {label: 'Producto', width: 200 },
            {label: 'Precio Unit', width: 90 },
            {label: 'Cantidad', width: 80 },
            {label: 'Subtotal', width: 85 },
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
                dibujarFooterCompra(doc, PAGE_W, PAGE_H, MARGIN, CONTENT_W, COLOR_PRIMARY);
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
        doc.fillColor(COLOR_WHITE).fontSize(12).font('Helvetica-Bold').text(`TOTAL: $${Number(compra.total).toFixed(2)}, MARCA`, MARGIN + 10, y + 9, { width: CONTENT_W - 20, align: 'right' });

        doc.save();
        dibujarFooterCompra(doc, PAGE_W, PAGE_H, MARGIN, CONTENT_W, COLOR_PRIMARY);

        doc.end();
    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Error al generar el PDF' });
        }
    }
};

function dibujarFooterCompra(doc, pageW, pageH, margin, contentW, colorPrimary) {
    doc.rect(0, pageH -40, pageW, 40).fill(colorPrimary);
    doc.fillColor('#ffffff').fontSize(8).font('Helvetica').text('© 2025 COMODIDAD A LA VISTA S.A. — Documento generado automáticamente. Confidencial.', margin, pageH - 30, { width: contentW, align: 'center' });
    
}