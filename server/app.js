const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todos');
const analyticsRoutes = require('./routes/analytics');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/analytics', analyticsRoutes);

module.exports = app;
