import { DataSource } from "typeorm";
import { config } from "./config";

import { Machine } from '../entities/Machine';
import { Event } from '../entities/Event';
import { Order } from '../entities/Order';
import { Production } from '../entities/Production';
import { Recipe } from '../entities/Recipe';
import { Settings } from '../entities/Settings';
import { Worker } from '../entities/Worker';
import { WorkerLog } from '../entities/WorkerLog';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export async function createConnection() {
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
}