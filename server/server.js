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
const runnerRoutes = require('./router/runners');
const businessTypeRoutes = require('./router/business_types');
const reportRoutes = require('./router/report');
const bankRoutes = require('./router/bank');


// 1. Define allowed origins
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:5173',
    'https://branchportal.bezawcurbside.com',
    'https://branchapi.bezawcurbside.com',
    'https://branch.ristestate.com'
];

// 2. Comprehensive CORS Middleware
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin) || (process.env.NODE_ENV !== 'production' && origin?.startsWith('http://localhost'))) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Handle Preflight
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});

// 3. Keep standard CORS as backup for complex rules
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use(helmet({
    contentSecurityPolicy: false, // Temporarily disable CSP if it conflicts heavily with local dev tools (Vite/React often need blobs/unsafe-eval)
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: "no-referrer-when-downgrade" } // More compatible for local dev
}));

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
app.use('/api/runners', runnerRoutes);
app.use('/api/business-types', businessTypeRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/bank', bankRoutes);





const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
