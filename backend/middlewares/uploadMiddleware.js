const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/productos');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const nombre = 'prod_' + Date.now() + ext;
        cb(null, nombre);
    }
})

const filter = (req, file, cb) => {
    const tiposPermitidos = ['image/jpeg', 'image/png'];

    if (!tiposPermitidos.includes(file.mimetype)) {
        cb
    } else {
        cb(new Error('Tipo de archivo no permitido'), false);
    }
};

const upload = multer({ storage, filter });

module.exports = upload;