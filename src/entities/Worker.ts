import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, BaseEntity } from "typeorm";
import { Machine } from "./Machine";
import { Order } from "./Order";
import { WorkerLog } from "./WorkerLog";

export enum WorkerStatus {
    InFactory = "InFactory",
    NotInFactory = "NotInFactory"
}

@Entity()
export class Worker extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "text" })
    name: string;

    @Column({
        type: "enum",
        enum: WorkerStatus,
        default: WorkerStatus.NotInFactory
    })
    status: WorkerStatus;

    @Column({ type: "int" })
    code: number;

    @Column({ type: "varchar" })
    phoneNumber: string;

    @Column({ type: "boolean" })
    isLoggedIn: boolean;

    @Column({ type: "datetime", nullable: true })
    lastLoginAt: Date | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Machine, machine => machine.worker)
    machines: Machine[];

    @OneToMany(() => Order, order => order.currentWorker)
    currentOrders: Order[];

    @OneToMany(() => WorkerLog, workerLog => workerLog.worker)
    workerLogs: WorkerLog[];
}