import express from 'express';
import cors from 'cors';

const app = express();

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));

//cors

app.use(
    cors({
        origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }),
);

import healthCheckRouter from './src/routes/healthcheck.routes.js';
import authRouter from './src/routes/auth.routes.js';

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/healthcheck', healthCheckRouter);

app.get('/instagram', (req, res) => {
    res.send('Hello from Instagram');
});

export default app;
