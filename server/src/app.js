import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import customizationRoutes from './routes/customization.routes.js';

const app = express();

// Security Headers
app.use(helmet());

// CORS configuration
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  })
);

// Global Rate Limiter for general endpoints
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests, please try again later.',
  },
});
app.use(generalLimiter);

// Parsing middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'dev-cookie-secret'));

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'gifts-galore-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Authentication & Session Routes
app.use('/api/v1/auth', authRoutes);

// Catalog & Product Routes
app.use('/api/v1/products', productRoutes);

// Customization & Personalization Routes
app.use('/api/v1', customizationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Endpoint ${req.originalUrl} not found on this server.`,
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    ...(isProduction ? {} : { stack: err.stack }),
  });
});

export default app;
