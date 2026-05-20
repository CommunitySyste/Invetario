const productosModel = require('../models/productosModel');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

exports.getProductos = async (req, res) => {
    try {
        const data = await productosModel.getProductos();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error al conectar con la base de datos' });
    }
}

exports.getStatsProductos = async (req, res) => {
    try {
        const data = await productosModel.getStatsProductos();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error al conectar con la base de datos' });
        console.error(error);
    }
}

exports.createProducto = async (req, res) => {
    try {
        const { nombre, categoria_id, precio, stock, descripcion, estado, proveedor_id } = req.body;

        const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');

        const imagen = req.file ? req.file.filename : null;

        await productosModel.createProducto({ nombre, categoria_id, precio, stock, descripcion, imagen, created_at: fecha, estado, proveedor_id });
        res.json({ message: 'Producto creado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el producto' });
    }
}

exports.updateProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, categoria_id, precio, stock, descripcion, estado, proveedor_id } = req.body;

        const productoActual = await productosModel.getProductoById(id);

        let imagen = productoActual.imagen;

        if (req.file) {

            if (productoActual.imagen) {
                const rutaImagen = path.join(__dirname, '../uploads/productos', productoActual.imagen);

                if (fs.existsSync(rutaImagen)) {
                    fs.unlinkSync(rutaImagen);
                }
            }
            imagen = req.file.filename;
        }

        await productosModel.updateProducto(id, { nombre, categoria_id, precio, stock, descripcion, estado, imagen, proveedor_id});

        res.json({ message: 'Producto actualizado correctamente' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el producto' });
    }
};

exports.deleteProducto = async (req, res) => {
    try {
        const { id } = req.params;

        const producto = await productosModel.getProductoById(id);

        if (producto && producto.imagen) {
            const rutaImagen = path.join(__dirname, '../uploads/productos', producto.imagen);

            if (fs.existsSync(rutaImagen)) {
                try {
                    fs.unlinkSync(rutaImagen);
                } catch (error) {
                    console.error(error);
                }
            }
        }

        await productosModel.deleteProducto(id);

        res.json({ message: 'Producto eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el producto' });
    }
}

exports.getProductoByProveedor = async (req, res) => {
    try {
        const { proveedor_id } = req.params;

        const productos = await productosModel.getProductoByProveedor(proveedor_id);

        res.json(productos);
    } catch (error) {
        res.status(500).json({ message: 'Error al conectar con la base de datos' });
    }
}

exports.generarPDFProductos = async (req, res) => {
    try {
        const productos = await productosModel.getProductos();
        if (!productos || !Array.isArray(productos)) {
            return res.status(500).send('Datos inválidos');
        }

        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument({ margin: 40, size: 'A4' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=productos.pdf');
        doc.pipe(res);

        const COLOR_PRIMARY   = '#1a237e';
        const COLOR_SECONDARY = '#e8eaf6';
        const COLOR_ACCENT    = '#3949ab'; 
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

        doc.fillColor('#c5cae9').fontSize(9).text('Generado automáticamente', MARGIN, 36, { width: CONTENT_W, align: 'right' });

        doc.rect(0, 90, PAGE_W, 36).fill(COLOR_ACCENT);
        doc.fillColor(COLOR_WHITE).fontSize(14).font('Helvetica-Bold').text('REPORTE DE PRODUCTOS', MARGIN, 100, { width: CONTENT_W, align: 'center' });

        let startY = 145;

        const totalProductos = productos.length;
        const totalStock = productos.reduce((s, p) => s + (Number(p.stock) || 0), 0);
        const totalValor = productos.reduce((s, p) =>
            s + (Number(p.precio) || 0) * (Number(p.stock) || 0), 0);
        const activos = productos.filter(p => p.estado === 'activo').length;

        const cards = [
            { label: 'Total Productos', value: totalProductos, symbol: '' },
            { label: 'Unidades en Stock', value: totalStock, symbol: '' },
            { label: 'Valor en Inventario', value: `$${totalValor.toFixed(2)}`, symbol: '' },
            { label: 'Productos Activos', value: activos, symbol: '' },
        ];

        const cardW = (CONTENT_W - 9) / 4;
        cards.forEach((card, i) => {
            const x = MARGIN + i * (cardW + 3);
            doc.rect(x, startY, cardW, 52).fill(COLOR_SECONDARY);
            doc.rect(x, startY, cardW, 4).fill(COLOR_ACCENT);

            doc.fillColor(COLOR_MUTED).fontSize(8).font('Helvetica').text(card.label.toUpperCase(), x + 6, startY + 10, { width: cardW - 12 });

            doc.fillColor(COLOR_PRIMARY).fontSize(16).font('Helvetica-Bold').text(String(card.value), x + 6, startY + 24, { width: cardW - 12 });
        });

        startY += 68;

        const cols = [
            { label: '#',          width: 30  },
            { label: 'Nombre',     width: 160 },
            { label: 'Categoría',  width: 100 },
            { label: 'Precio',     width: 70  },
            { label: 'Stock',      width: 60  },
            { label: 'Estado',     width: 70  },
        ];
        const rowH = 22;

        let x = MARGIN;
        doc.rect(MARGIN, startY, CONTENT_W, rowH).fill(COLOR_ACCENT);
        cols.forEach(col => {
            doc.fillColor(COLOR_WHITE)
               .fontSize(9)
               .font('Helvetica-Bold')
               .text(col.label, x + 5, startY + 7, { width: col.width - 10 });
            x += col.width;
        });

        let y = startY + rowH;

                productos.forEach((p, index) => {

    if (y + rowH > PAGE_H - 60 && index < productos.length - 1) {
        doc.addPage();

        x = MARGIN;
        doc.rect(MARGIN, 40, CONTENT_W, rowH).fill(COLOR_ACCENT);

        cols.forEach(col => {
            doc.fillColor(COLOR_WHITE)
               .fontSize(9)
               .font('Helvetica-Bold')
               .text(col.label, x + 5, 47, { width: col.width - 10 });
            x += col.width;
        });

        y = 40 + rowH;
    }

            const bgColor = index % 2 === 0 ? COLOR_WHITE : COLOR_SECONDARY;
            doc.rect(MARGIN, y, CONTENT_W, rowH).fill(bgColor);

            doc.moveTo(MARGIN, y + rowH).lineTo(MARGIN + CONTENT_W, y + rowH).strokeColor(COLOR_BORDER).lineWidth(0.5).stroke();

            const estado = (p.estado || '').toLowerCase();
            const filaData = [
                String(index + 1),
                p.nombre || '',
                p.categoriaNombre || '',
                `$${Number(p.precio || 0).toFixed(2)}`,
                String(p.stock || 0),
                p.estado || '',
            ];

            x = MARGIN;
            cols.forEach((col, ci) => {
                let cellText = filaData[ci];

                if (ci === 5) {
                    const pillColor = estado === 'activo' ? '#43a047' : '#e53935';
                    const pillX = x + 5;
                    const pillY = y + 6;
                    doc.rect(pillX, pillY, 55, 11).fill(pillColor);
                    doc.fillColor(COLOR_WHITE).fontSize(8).font('Helvetica-Bold').text(cellText.toUpperCase(), pillX, pillY + 2, { width: 55, align: 'center' });
                } else {
                    doc.fillColor(COLOR_TEXT).fontSize(9).font('Helvetica').text(cellText, x + 5, y + 7, { width: col.width - 10, ellipsis: true });
                }
                x += col.width;
            });

            y += rowH;
        });

        y += 12;
        
        doc.rect(MARGIN, y, CONTENT_W, 24).fill(COLOR_SECONDARY);
        doc.fillColor(COLOR_PRIMARY).fontSize(10).font('Helvetica-Bold').text(`TOTAL: ${totalProductos} productos  |  Stock total: ${totalStock} uds  |  Valor inventario: $${totalValor.toFixed(2)}`,MARGIN + 10, y + 7, { width: CONTENT_W - 20 });

        doc.end();

    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).send('Error generando PDF');
        }
    }
};

exports.generarPDFProductosIndividual = async (req, res) => {
    try {
        const { id } = req.params;
        const producto = await productosModel.getProductoById(id);
        
        if (!producto) return res.status(404).send('Producto no encontrado');

        const PDFDocument = require('pdfkit');
        const path = require('path');
        const doc = new PDFDocument({ margin: 40, size: 'A4' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=producto_${id}.pdf`); // ✅ backticks

        doc.pipe(res);

        const COLOR_PRIMARY   = '#1a237e';
        const COLOR_ACCENT    = '#3949ab';
        const COLOR_SECONDARY = '#e8eaf6';
        const COLOR_TEXT      = '#212121';
        const COLOR_MUTED     = '#757575';
        const COLOR_WHITE     = '#ffffff';
        const COLOR_BORDER    = '#c5cae9';

        const PAGE_W    = doc.page.width;
        const PAGE_H    = doc.page.height;
        const MARGIN    = 40;
        const CONTENT_W = PAGE_W - MARGIN * 2;

        doc.rect(0, 0, PAGE_W, 90).fill(COLOR_PRIMARY);

        doc.fillColor(COLOR_WHITE).fontSize(20).font('Helvetica-Bold')
           .text('EL TEMPLO FASHOW S.A.', MARGIN, 18, { width: CONTENT_W * 0.6 });

        doc.fillColor('#c5cae9').fontSize(10).font('Helvetica')
           .text('RUC: 0912345678001 | Latacunga, Ecuador', MARGIN, 44);

        const fecha = new Date().toLocaleDateString('es-EC', {
            day: '2-digit', month: 'long', year: 'numeric'
        });
        doc.fillColor(COLOR_WHITE).fontSize(9)
           .text(`Fecha: ${fecha}`, MARGIN, 22, { width: CONTENT_W, align: 'right' });
        doc.fillColor('#c5cae9').fontSize(9)
           .text('Ficha de Producto', MARGIN, 36, { width: CONTENT_W, align: 'right' });

        doc.rect(0, 90, PAGE_W, 36).fill(COLOR_ACCENT);
        doc.fillColor(COLOR_WHITE).fontSize(14).font('Helvetica-Bold')
           .text('DETALLE DE PRODUCTO', MARGIN, 100, { width: CONTENT_W, align: 'center' });

        const estado = (producto.estado || '').toLowerCase();
        const estadoColor = estado === 'activo' ? '#43a047' : '#e53935';
        doc.rect(PAGE_W - MARGIN - 70, 136, 70, 22).fill(estadoColor);
        doc.fillColor(COLOR_WHITE).fontSize(9).font('Helvetica-Bold')
           .text((producto.estado || '').toUpperCase(), PAGE_W - MARGIN - 70, 142, { width: 70, align: 'center' });

        let startY = 175;
        const IMG_SIZE = 160;

        if (producto.imagen) {
            const ruta = path.join(__dirname, '../uploads/productos', producto.imagen);
            const fs = require('fs');
            if (fs.existsSync(ruta)) {
                doc.rect(MARGIN, startY, IMG_SIZE, IMG_SIZE).fill(COLOR_SECONDARY);
                doc.image(ruta, MARGIN, startY, { width: IMG_SIZE, height: IMG_SIZE, fit: [IMG_SIZE, IMG_SIZE], align: 'center', valign: 'center' });
                doc.rect(MARGIN, startY, IMG_SIZE, IMG_SIZE).strokeColor(COLOR_BORDER).lineWidth(1).stroke();
            }
        } else {
            doc.rect(MARGIN, startY, IMG_SIZE, IMG_SIZE).fill(COLOR_SECONDARY);
            doc.fillColor(COLOR_MUTED).fontSize(10).font('Helvetica')
               .text('Sin imagen', MARGIN, startY + IMG_SIZE / 2 - 6, { width: IMG_SIZE, align: 'center' });
        }

        const infoX  = MARGIN + IMG_SIZE + 20;
        const infoW  = CONTENT_W - IMG_SIZE - 20;
        let   infoY  = startY;

        doc.fillColor(COLOR_PRIMARY).fontSize(18).font('Helvetica-Bold')
           .text(producto.nombre || '', infoX, infoY, { width: infoW });

        infoY += 30;

        doc.rect(infoX, infoY, infoW, 40).fill(COLOR_PRIMARY);
        doc.fillColor('#c5cae9').fontSize(9).font('Helvetica')
           .text('PRECIO UNITARIO', infoX + 10, infoY + 6);
        doc.fillColor(COLOR_WHITE).fontSize(22).font('Helvetica-Bold')
           .text(`$${Number(producto.precio || 0).toFixed(2)}`, infoX + 10, infoY + 16);

        infoY += 52;

        const quickData = [
            { label: 'Categoría', value: producto.categoriaNombre || 'N/A' },
            { label: 'Stock',     value: `${producto.stock || 0} unidades` },
        ];

        quickData.forEach((item, i) => {
            const qX = infoX + (i % 2) * (infoW / 2);
            doc.rect(qX, infoY, infoW / 2 - 5, 44).fill(COLOR_SECONDARY);
            doc.rect(qX, infoY, infoW / 2 - 5, 4).fill(COLOR_ACCENT);
            doc.fillColor(COLOR_MUTED).fontSize(8).font('Helvetica')
               .text(item.label.toUpperCase(), qX + 6, infoY + 10, { width: infoW / 2 - 15 });
            doc.fillColor(COLOR_PRIMARY).fontSize(13).font('Helvetica-Bold')
               .text(item.value, qX + 6, infoY + 22, { width: infoW / 2 - 15 });
        });

        let descY = startY + IMG_SIZE + 24;

        doc.rect(MARGIN, descY, CONTENT_W, 22).fill(COLOR_ACCENT);
        doc.fillColor(COLOR_WHITE).fontSize(10).font('Helvetica-Bold')
           .text('DESCRIPCIÓN', MARGIN + 10, descY + 6);

        descY += 22;
        doc.rect(MARGIN, descY, CONTENT_W, 70).fill(COLOR_SECONDARY);
        doc.fillColor(COLOR_TEXT).fontSize(10).font('Helvetica')
           .text(producto.descripcion || 'Sin descripción disponible.', MARGIN + 10, descY + 10, {
               width: CONTENT_W - 20,
               height: 55,
               ellipsis: true
           });

        let tableY = descY + 82;

        doc.rect(MARGIN, tableY, CONTENT_W, 22).fill(COLOR_ACCENT);
        doc.fillColor(COLOR_WHITE).fontSize(10).font('Helvetica-Bold')
           .text('RESUMEN', MARGIN + 10, tableY + 6);

        tableY += 22;

        const resumen = [
            { campo: 'Nombre',     valor: producto.nombre || '' },
            { campo: 'Categoría',  valor: producto.categoriaNombre || '' },
            { campo: 'Precio',     valor: `$${Number(producto.precio || 0).toFixed(2)}` },
            { campo: 'Stock',      valor: `${producto.stock || 0} unidades` },
            { campo: 'Estado',     valor: (producto.estado || '').toUpperCase() },
        ];

        resumen.forEach((row, i) => {
            const rowY  = tableY + i * 24;
            const bgRow = i % 2 === 0 ? COLOR_WHITE : COLOR_SECONDARY;
            doc.rect(MARGIN, rowY, CONTENT_W, 24).fill(bgRow);
            doc.moveTo(MARGIN, rowY + 24).lineTo(MARGIN + CONTENT_W, rowY + 24)
               .strokeColor(COLOR_BORDER).lineWidth(0.5).stroke();

            doc.fillColor(COLOR_MUTED).fontSize(9).font('Helvetica-Bold')
               .text(row.campo, MARGIN + 10, rowY + 7, { width: 120 });
            doc.fillColor(COLOR_TEXT).fontSize(9).font('Helvetica')
               .text(row.valor, MARGIN + 140, rowY + 7, { width: CONTENT_W - 150 });
        });

        doc.rect(MARGIN, tableY, CONTENT_W, resumen.length * 24)
           .strokeColor(COLOR_BORDER).lineWidth(1).stroke();


        doc.end();

    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Error al generar el PDF' });
        }
    }
};