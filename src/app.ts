import 'reflect-metadata';
import express from 'express';
import { DataSource } from 'typeorm';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

// Import config
import { config } from './utils/config';

// Import routes
import machineRoutes from './routes/machines';
import orderRoutes from './routes/orders';
import recipeRoutes from './routes/recipes';
import workerRoutes from './routes/workers';
import productionRoutes from './routes/productions';
import settingsRoutes from './routes/settings';
import eventRoutes from './routes/events';
import authRoutes from './routes/auth';

// Import middlewares
import { authMiddleware } from './middleware/authMiddleware';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { Machine } from './entities/Machine';
import { Event } from './entities/Event';
import { Order } from './entities/Order';
import { Production } from './entities/Production';
import { Recipe } from './entities/Recipe';
import { Settings } from './entities/Settings';
import { Worker } from './entities/Worker';
import { WorkerLog } from './entities/WorkerLog';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

const app = express();

// Middlewares
app.use(cors({
    origin: config.app.corsAllowedOrigins.split(',').map(origin => origin.trim()),
    credentials: true,
}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/machines', authMiddleware, machineRoutes);
app.use('/api/orders', authMiddleware, orderRoutes);
app.use('/api/recipes', authMiddleware, recipeRoutes);
app.use('/api/workers', authMiddleware, workerRoutes);
app.use('/api/productions', authMiddleware, productionRoutes);
app.use('/api/settings', authMiddleware, settingsRoutes);
app.use('/api/events', authMiddleware, eventRoutes);

// Error handling
app.use(errorHandler);
app.use(notFoundHandler);

// Database connection and server start
const startServer = async () => {
    try {
        const dataSource = new DataSource({
            type: "mysql",
            host: config.database.host,
            port: config.database.port,
            username: config.database.username,
            password: config.database.password,
            database: config.database.database,
            entities: [
                Event,
                Machine,
                Order,
                Production,
                Recipe,
                Settings,
                Worker,
                WorkerLog
            ],
            synchronize: true,
            namingStrategy: new SnakeNamingStrategy()
        });

        await dataSource.initialize();
        console.log('Database connected');

        app.listen(config.app.port, () => {
            console.log(`Server running on port ${config.app.port}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

startServer();

export default app;
