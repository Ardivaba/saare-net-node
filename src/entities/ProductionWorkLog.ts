import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, BaseEntity } from "typeorm";
import { Production } from "./Production";
import { Worker } from "./Worker";

@Entity()
export class ProductionWorkLog extends BaseEntity {
    @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
    id: number;

    @Column({ type: "bigint", unsigned: true })
    production_id: number;

    @Column({ type: "int" })
    worker_id: number;

    @Column({ type: "int", unsigned: true, default: 0 })
    duration_seconds: number;

    @Column({ type: "double", default: 0 })
    produced_quantity: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @ManyToOne(() => Production, production => production.workLogs)
    production: Production;

    @ManyToOne(() => Worker, worker => worker.productionWorkLogs)
    worker: Worker;
}