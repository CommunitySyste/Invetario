require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db/db');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit')

const app = express();

const port = process.env.PORT || 3000;

app.use(helmet())

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    message: 'Demasiados peticiones, intente mas tarde',
  }
})

app.use(limiter)

app.use(cors({
  origin: [
    'http://localhost',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ],
  credentials: true,
}));
app.use(express.json());


const authRoutes = require('./routes/authRoutes');
const rolRoutes = require('./routes/rolRouters');
const permisosRoutes = require('./routes/permisosRoutes');
const userRoutes = require('./routes/userRoutes');
const menuRoutes = require('./routes/menuRoutes');
const subMenuRoutes = require('./routes/subMenuRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const productosRoutes = require('./routes/productosRoutes');
const movimientosRoutes = require('./routes/movimientosRoutes');
const indexRoutes = require('./routes/indexRoutes');
const proveedorRoutes = require('./routes/proveedoresRoutes');
const comprasRoutes = require('./routes/comprasRoutes');
const ventasRoutes = require('./routes/ventasRoutes');
const reportesRoutes = require('./routes/reportesRoutes');
const stockRoutes = require('./routes/stockRoutes');

app.use('/api', authRoutes);
app.use('/api/roles', rolRoutes);
app.use('/api/permisos', permisosRoutes);
app.use('/api/users', userRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/submenus', subMenuRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/productos', productosRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/movimientos', movimientosRoutes);
app.use('/api/index', indexRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/compras', comprasRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/stock', stockRoutes);


app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});