const productosModel = require('../models/productosModel');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

exports.getProductos = async (req, res) => {
    try {
        const data = await productosModel.getStats();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al conectar con la base de datos' });
    }
}
exports.getByCategoria = async (req, res) => {
    try {
        const data = await productosModel.getByCategoria();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error al conectar con la base de datos' });
        console.error(error);
    }
}

exports.getByMes = async (req, res) => {
    try {
        const data = await productosModel.getByMes();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error al conectar con la base de datos' });
        console.error(error);
    }
}

exports.getStock = async (req, res) => {
    try {
        const data = await productosModel.getStock();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error al conectar con la base de datos' });
        console.error(error);
    }
}
exports.getStockBajo = async (req, res) => {
    try {
        const data = await productosModel.getStockBajo();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error al conectar con la base de datos' });
        console.error(error);
    }
}