import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, BaseEntity } from "typeorm";
import { Machine } from "./Machine";
import { Order } from "./Order";
import { WorkerLog } from "./WorkerLog";
import { ProductionWorkLog } from "./ProductionWorkLog";

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
    phone_number: string;

    @Column({ type: "boolean", default: true })
    is_logged_in: boolean;

    @Column({ type: "datetime", nullable: true })
    last_login_at: Date | null;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @OneToMany(() => Machine, machine => machine.worker)
    machines: Machine[];

    @OneToMany(() => Order, order => order.current_worker)
    current_orders: Order[];

    @OneToMany(() => WorkerLog, workerLog => workerLog.worker)
    worker_logs: WorkerLog[];

    @OneToMany(() => ProductionWorkLog, workLog => workLog.worker)
    productionWorkLogs: ProductionWorkLog[];
}