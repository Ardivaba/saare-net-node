import { Worker, WorkerStatus } from "../../../entities/Worker";

export async function seedWorkers() {
    const startDate = new Date(2024, 0, 1);
    const endDate = new Date(2024, 0, 31, 23, 59, 59);

    const workers = [
        { name: "Erko", phone_number: "55612329", is_logged_in: false },
        { name: "Jarko", phone_number: "58451354", is_logged_in: false },
        { name: "Jaan", phone_number: "5176792", is_logged_in: false },
        { name: "Andres", phone_number: "54631499", is_logged_in: true },
    ];

    for (const workerData of workers) {
        const worker = new Worker();
        worker.name = workerData.name;
        worker.status = workerData.is_logged_in ? WorkerStatus.InFactory : WorkerStatus.NotInFactory;
        worker.phone_number = workerData.phone_number;
        worker.is_logged_in = workerData.is_logged_in;
        worker.code = Math.floor(Math.random() * 90000) + 10000;

        const randomCreationDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
        worker.created_at = randomCreationDate;
        worker.updated_at = randomCreationDate;

        if (worker.is_logged_in) {
            worker.last_login_at = randomCreationDate;
        } else {
            worker.last_login_at = null;
        }

        await worker.save();
    }
    console.log('Workers seeded');
}
