import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, BaseEntity } from "typeorm";
import { Order } from "./Order";
import { Worker } from "./Worker";

@Entity()
export class WorkerLog extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Order, order => order.workerLogs)
    order: Order;

    @ManyToOne(() => Worker, worker => worker.workerLogs)
    worker: Worker;

    @Column("float")
    amount: number;

    @CreateDateColumn()
    timestamp: Date;
}
