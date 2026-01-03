require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { query } = require('./connection/db'); // import your db.js
const path = require('path');


const helmet = require('helmet');

const app = express();

const forgetRoutes = require('./auth/forget');
const loginRoutes = require('./auth/login');
const profileRoutes = require('./auth/profile');
const orderRoutes = require('./router/orders');
const productRoutes = require('./router/product');
const categoryRoutes = require('./router/category');
const bundlesRoutes = require('./router/bundles');
const uploadRoutes = require('./utils/upload');

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/forget', forgetRoutes);
app.use('/api/auth', loginRoutes);
app.use('/api/auth', profileRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/bundles', bundlesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', require('./router/analytics'));
app.use('/api/feedback', require('./router/feedback'));
app.use('/api/users', require('./router/user'));
app.use('/api/settings', require('./router/setting'));











const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
