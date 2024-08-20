import { createConnection, Connection } from 'typeorm';
import { Event, EventType } from '../entities/Event';
import { Machine, MachineState } from '../entities/Machine';
import { Order } from '../entities/Order';
import { Production } from '../entities/Production';
import { Recipe } from '../entities/Recipe';
import { Settings } from '../entities/Settings';
import { Worker, WorkerStatus } from '../entities/Worker';
import { WorkerLog } from '../entities/WorkerLog';
import { config } from '../utils/config';

const NumWorkers = 4;
const NumRecipes = 25;
const NumOrders = 30;
const NumMachines = 1;
const NumProductions = 50;
const NumEvents = 100;

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

async function seedSettings() {
    const settings = new Settings();
    settings.maxParkingTime = 120;
    settings.parkingLotActive = true;
    settings.totalSpaces = 16;
    settings.takenSpaces = Math.floor(Math.random() * 16);
    settings.signalDelayTime = 5;

    await settings.save();
    console.log('Settings seeded');
}

async function seedWorkers() {
    const startDate = new Date(2024, 0, 1);
    const endDate = new Date(2024, 0, 31, 23, 59, 59);

    const workers = [
        { name: "Erko", phoneNumber: "55612329", isLoggedIn: false },
        { name: "Jarko", phoneNumber: "58451354", isLoggedIn: false },
        { name: "Jaan", phoneNumber: "5176792", isLoggedIn: false },
        { name: "Andres", phoneNumber: "54631499", isLoggedIn: true },
    ];

    for (const workerData of workers) {
        const worker = new Worker();
        worker.name = workerData.name;
        worker.status = workerData.isLoggedIn ? WorkerStatus.InFactory : WorkerStatus.NotInFactory;
        worker.phoneNumber = workerData.phoneNumber;
        worker.isLoggedIn = workerData.isLoggedIn;
        worker.code = Math.floor(Math.random() * 90000) + 10000;

        const randomCreationDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
        worker.createdAt = randomCreationDate;
        worker.updatedAt = randomCreationDate;

        if (worker.isLoggedIn) {
            worker.lastLoginAt = randomCreationDate;
        } else {
            worker.lastLoginAt = null;
        }

        await worker.save();
    }
    console.log('Workers seeded');
}

async function seedRecipes() {
    const recipes = [
        { code: 211080, description: "Ujukinöör 2 g/m 1m toornimesse (plast kast)", ropeLength: 1 },
        { code: 211449, description: "Ujukinöör 2 g/m 550m lattu (kast)", ropeLength: 550 },
        { code: 211468, description: "Ujukinöör 2 g/m 275m lattu (kast)", ropeLength: 275 },
        { code: 211031, description: "Ujukinöör 2 g/m 100m lattu (kott)", ropeLength: 100 },
        { code: 211441, description: "Ujukinöör 2.5 g/m 550m lattu (kast)", ropeLength: 550 },
        { code: 211440, description: "Ujukinöör 2.5 g/m 275m lattu (kast)", ropeLength: 275 },
        { code: 211103, description: "Ujukinöör 3 g/m 1m toornimesse (plast kast)", ropeLength: 1 },
        { code: 211442, description: "Ujukinöör 3 g/m 550m lattu (kast)", ropeLength: 550 },
        { code: 211035, description: "Ujukinöör 3.5 g/m 1m toornimesse (plast kast)", ropeLength: 1 },
        { code: 211443, description: "Ujukinöör 3.5 g/m 550m lattu (kast)", ropeLength: 550 },
        { code: 211471, description: "Ujukinöör 3.5 g/m 275m lattu (kast)", ropeLength: 275 },
        { code: 211040, description: "Ujukinöör 3.5 g/m 100m lattu (kott)", ropeLength: 100 },
        { code: 211444, description: "Ujukinöör 4 g/m 550m lattu (kast)", ropeLength: 550 },
        { code: 211460, description: "Ujukinöör 4 g/m 275m lattu (kast)", ropeLength: 275 },
        { code: 211045, description: "Ujukinöör 4.5 g/m toornimesse (plast kast)", ropeLength: 1 },
        { code: 211445, description: "Ujukinöör 4.5 g/m 550m lattu (kast)", ropeLength: 550 },
        { code: 211461, description: "Ujukinöör 4.5 g/m 275m lattu (kast)", ropeLength: 275 },
        { code: 211050, description: "Ujukinöör 5 g/m 1m toornimesse (plast kast)", ropeLength: 1 },
        { code: 211450, description: "Ujukinöör 5 g/m 550m lattu (kast)", ropeLength: 550 },
        { code: 211462, description: "Ujukinöör 5 g/m 275m lattu (kast)", ropeLength: 275 },
        { code: 211055, description: "Ujukinöör 5.5 g/m 1m toornimesse (plast kast)", ropeLength: 1 },
        { code: 211446, description: "Ujukinöör 5.5 g/m 550m lattu (kast)", ropeLength: 550 },
        { code: 211056, description: "Ujukinöör 5.5 g/m 275m lattu (kast)", ropeLength: 275 },
        { code: 211065, description: "Ujukinöör 6.5 g/m 1m toornimesse (plast kast)", ropeLength: 1 },
        { code: 211447, description: "Ujukinöör 6.5 g/m 550m lattu (kast)", ropeLength: 550 },
    ];

    for (const recipeData of recipes) {
        const recipe = new Recipe();
        recipe.code = recipeData.code;
        recipe.description = recipeData.description;
        recipe.ropeLength = recipeData.ropeLength;
        recipe.floatGap = randFloat(30, 900);
        recipe.floatLength = randFloat(10, 100);
        recipe.createdAt = new Date(Date.now() - Math.random() * 100 * 24 * 3600000);
        recipe.updatedAt = new Date();

        await recipe.save();
    }
    console.log('Recipes seeded');
}

function randFloat(min: number, max: number): number {
    return Math.floor(min + Math.random() * (max - min));
}

async function seedOrders() {
    const recipes = await Recipe.find();

    for (let i = 1; i <= NumOrders; i++) {
        const recipe = recipes[Math.floor(Math.random() * recipes.length)];
        const amountOrdered = Math.floor(Math.random() * 10) + 1;
        const amountProduced = Math.floor(Math.random() * (amountOrdered + 1));
        const isFinished = amountProduced >= amountOrdered;

        const order = new Order();
        order.recipe = recipe;
        order.info = `Tellimus nr ${i} - ${recipe.description}`;
        order.amountOrdered = amountOrdered;
        order.amountProduced = amountProduced;
        order.isFinished = isFinished;
        order.createdAt = new Date(Date.now() - Math.random() * 100 * 24 * 3600000);
        order.updatedAt = new Date();

        await order.save();
    }
    console.log('Orders seeded');
}

async function seedWorkerLogs() {
    const orders = await Order.find({ relations: ['recipe'] });
    const workers = await Worker.find();

    if (workers.length === 0) {
        console.error('No workers found, cannot create worker logs');
        return;
    }

    for (const order of orders) {
        let remainingAmount = order.amountProduced;
        if (remainingAmount <= 0) {
            continue;
        }

        const numLogs = Math.min(workers.length, Math.floor(remainingAmount));
        for (let j = 0; j < numLogs && remainingAmount > 0; j++) {
            const worker = workers[Math.floor(Math.random() * workers.length)];
            let amount = 0;

            if (j === numLogs - 1 || remainingAmount <= 1) {
                amount = remainingAmount;
            } else {
                const maxAmount = Math.floor(remainingAmount);
                amount = maxAmount > 1 ? Math.floor(Math.random() * (maxAmount - 1)) + 1 : 1;
            }

            const workerLog = new WorkerLog();
            workerLog.order = order;
            workerLog.worker = worker;
            workerLog.amount = amount;
            workerLog.timestamp = new Date(order.createdAt.getTime() + Math.random() * (Date.now() - order.createdAt.getTime()));

            await workerLog.save();

            remainingAmount -= amount;
        }
    }
    console.log('Worker logs seeded');
}

async function seedMachines() {
    const workers = await Worker.find();
    const recipes = await Recipe.find();

    for (let i = 1; i <= NumMachines; i++) {
        const machine = new Machine();
        machine.ip = "192.168.1.147";
        machine.recipeCode = i;
        machine.name = `MASIN-${i}`;
        machine.producedRopeLength = Math.random() * 1000;
        machine.offTime = Math.floor(Math.random() * 24 * 3600000);
        machine.idleTime = Math.floor(Math.random() * 60 * 60000);
        machine.producingTime = Math.floor(Math.random() * 24 * 3600000);
        machine.state = randomMachineState();
        machine.recipeLoaded = true;

        if (Math.random() < 0.7) {
            const recipe = recipes[Math.floor(Math.random() * recipes.length)];
            machine.floatLength = recipe.floatLength;
            machine.floatGap = recipe.floatGap;
            machine.ropeLength = recipe.ropeLength;
        }

        if (Math.random() < 0.5) {
            const worker = workers[Math.floor(Math.random() * workers.length)];
            machine.worker = worker;
        }

        await machine.save();
    }
    console.log('Machines seeded');
}

async function seedProductions() {
    const recipes = await Recipe.find();
    const machines = await Machine.find();

    if (machines.length === 0) {
        console.error('No machines found, cannot create productions');
        return;
    }

    for (let i = 0; i < NumProductions; i++) {
        const startDate = new Date(Date.now() - Math.random() * 30 * 24 * 3600000);
        const endDate = new Date(startDate.getTime() + Math.random() * 24 * 3600000);

        const recipe = recipes[Math.floor(Math.random() * recipes.length)];
        const machine = machines[Math.floor(Math.random() * machines.length)];

        const production = new Production();
        production.recipeCode = recipe.code;
        production.startDate = startDate;
        production.endDate = endDate;
        production.startQuantity = 0;
        production.producedQuantity = Math.random() * 1000;
        production.createdAt = startDate;
        production.updatedAt = endDate;
        production.machine = machine;

        await production.save();
    }
    console.log('Productions seeded');
}

async function seedEvents() {
    const workers = await Worker.find();
    const orders = await Order.find({ relations: ['recipe'] });
    const machines = await Machine.find();
    const productions = await Production.find();

    const eventTypes: EventType[] = [
        EventType.OrderCreated,
        EventType.OrderUpdated,
        EventType.OrderCompleted,
        EventType.ProductionStarted,
        EventType.ProductionCompleted,
        EventType.MachineStatusChanged,
        EventType.WorkerLoggedIn,
        EventType.WorkerLoggedOut,
    ];

    for (let i = 0; i < NumEvents; i++) {
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        let data: any = {};

        switch (eventType) {
            case EventType.OrderCreated:
            case EventType.OrderUpdated:
            case EventType.OrderCompleted:
                if (orders.length > 0) {
                    const order = orders[Math.floor(Math.random() * orders.length)];
                    if (order && order.recipe) {
                        data = {
                            order_id: order.id,
                            recipe_id: order.recipe.id,
                            amount_ordered: order.amountOrdered,
                        };
                    }
                }
                break;
            case EventType.ProductionStarted:
            case EventType.ProductionCompleted:
                if (productions.length > 0) {
                    const production = productions[Math.floor(Math.random() * productions.length)];
                    data = {
                        production_id: production.id,
                        quantity: production.producedQuantity,
                    };
                }
                break;
            case EventType.MachineStatusChanged:
                if (machines.length > 0) {
                    const machine = machines[Math.floor(Math.random() * machines.length)];
                    data = {
                        machine_id: machine.id,
                        new_status: machine.state,
                    };
                }
                break;
            case EventType.WorkerLoggedIn:
            case EventType.WorkerLoggedOut:
                if (workers.length > 0) {
                    const worker = workers[Math.floor(Math.random() * workers.length)];
                    data = {
                        worker_id: worker.id,
                        worker_name: worker.name,
                    };
                }
                break;
        }

        if (Object.keys(data).length > 0) {
            const event = new Event();
            event.type = eventType;
            event.data = data;
            event.createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 3600000);

            await event.save();
        }
    }
    console.log('Events seeded');
}

function randomMachineState(): MachineState {
    const states: MachineState[] = [
        MachineState.Producing,
        MachineState.Waiting,
        MachineState.Off,
    ];
    return states[Math.floor(Math.random() * states.length)];
}

main().catch(error => console.error(error));