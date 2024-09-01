import { Order } from "../../../entities/Order";
import { Worker } from "../../../entities/Worker";
import { WorkerLog } from "../../../entities/WorkerLog";

export async function seedWorkerLogs() {
    const orders = await Order.find({ relations: ['recipe'] });
    const workers = await Worker.find();

    if (workers.length === 0) {
        console.error('No workers found, cannot create worker logs');
        return;
    }

    for (const order of orders) {
        let remainingAmount = order.amount_produced;
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
            workerLog.timestamp = new Date(order.created_at.getTime() + Math.random() * (Date.now() - order.created_at.getTime()));

            await workerLog.save();

            remainingAmount -= amount;
        }
    }
    console.log('Worker logs seeded');
}
