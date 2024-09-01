import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, BaseEntity } from "typeorm";
import { Order } from "./Order";
import { Worker } from "./Worker";

@Entity()
export class WorkerLog extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Order, order => order.worker_logs)
    order: Order;

    @ManyToOne(() => Worker, worker => worker.worker_logs)
    worker: Worker;

    @Column("float")
    amount: number;

    @CreateDateColumn()
    timestamp: Date;
}
