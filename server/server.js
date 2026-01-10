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
const analyticsRoutes = require('./router/analytics');
const systemRoutes = require('./router/system');
const feedbackRoutes = require('./router/feedback');
const userRoutes = require('./router/user');
const settingRoutes = require('./router/setting');
const storiesRoutes = require('./router/stories');
const adsRoutes = require('./router/ads');
const chatRoutes = require('./router/chat');
const giftsRoutes = require('./router/gifts');

app.use(helmet({
    contentSecurityPolicy: false, // Temporarily disable CSP if it conflicts heavily with local dev tools (Vite/React often need blobs/unsafe-eval)
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: "no-referrer-when-downgrade" } // More compatible for local dev
}));

const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? [process.env.FRONTEND_URL, 'http://localhost:5173'] // Add your production domains here
        : '*', // Allow all in development
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
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
app.use('/api/analytics', analyticsRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/stories', storiesRoutes);
app.use('/api/ads', adsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/gifts', giftsRoutes);




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
