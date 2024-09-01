import { createConnection, Connection } from 'typeorm';
import { Event } from '../entities/Event';
import { Machine } from '../entities/Machine';
import { Order } from '../entities/Order';
import { Production } from '../entities/Production';
import { Recipe } from '../entities/Recipe';
import { Settings } from '../entities/Settings';
import { Worker } from '../entities/Worker';
import { WorkerLog } from '../entities/WorkerLog';
import { config } from '../utils/config';
import { seedMachines } from './seed/seeds/seedMachines';
import { seedProductions } from './seed/seeds/seedProductions';
import { seedEvents } from './seed/seeds/seedEvents';
import { seedWorkerLogs } from './seed/seeds/seedWorkerLogs';
import { seedOrders } from './seed/seeds/seedOrders';
import { seedRecipes } from './seed/seeds/seedRecipes';
import { seedWorkers } from './seed/seeds/seedWorkers';
import { seedSettings } from './seed/seeds/seedSettings';

export const NumOrders = 30;
export const NumMachines = 10;
export const NumProductions = 50;
export const NumEvents = 100;

async function main() {
    console.log('Starting database seeding...');

    let connection: Connection;

    try {
        connection = await createConnection({
            type: "mysql",
            host: config.database.host,
            port: config.database.port,
            username: config.database.username,
            password: config.database.password,
            database: config.database.database,
            entities: [Event, Machine, Order, Production, Recipe, Settings, Worker, WorkerLog],
            synchronize: true,
        });

        console.log('Database connected');

        // Clear existing data
        await connection.query("SET FOREIGN_KEY_CHECKS = 0");
        await connection.query("TRUNCATE TABLE `settings`");
        await connection.query("TRUNCATE TABLE `worker`");
        await connection.query("TRUNCATE TABLE `recipe`");
        await connection.query("TRUNCATE TABLE `order`");
        await connection.query("TRUNCATE TABLE `worker_log`");
        await connection.query("TRUNCATE TABLE `machine`");
        await connection.query("TRUNCATE TABLE `production`");
        await connection.query("TRUNCATE TABLE `event`");
        await connection.query("SET FOREIGN_KEY_CHECKS = 1");

        // Seed data
        await seedSettings();
        await seedWorkers();
        await seedRecipes();
        await seedOrders();
        await seedWorkerLogs();
        await seedMachines();
        await seedProductions();
        await seedEvents();

        console.log('Seeding completed successfully');
    } catch (error) {
        console.error('Error during seeding:', error);
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

main().catch(error => console.error(error));
