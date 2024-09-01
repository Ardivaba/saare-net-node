import { EventType } from "../../../entities/Event";
import { Machine } from "../../../entities/Machine";
import { Order } from "../../../entities/Order";
import { Event } from "../../../entities/Event";
import { Worker } from "../../../entities/Worker";
import { Production } from "../../../entities/Production";
import { NumEvents } from "../../seed";

export async function seedEvents() {
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
                            amount_ordered: order.amount_ordered,
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
                        quantity: production.produced_quantity,
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
            event.created_at = new Date(Date.now() - Math.random() * 30 * 24 * 3600000);

            await event.save();
        }
    }
    console.log('Events seeded');
}
