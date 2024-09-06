import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, BaseEntity, OneToMany } from "typeorm";
import { Machine } from "./Machine";
import { Order } from "./Order";
import { ProductionWorkLog } from "./ProductionWorkLog";

@Entity()
export class Production extends BaseEntity {
    @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
    id: number;

    @Column({ type: "bigint", nullable: true })
    order_id: number | null;

    @Column({ type: "bigint" })
    recipe_code: number;

    @Column({ type: "datetime", precision: 3, nullable: true })
    start_date: Date | null;

    @Column({ type: "datetime", precision: 3, nullable: true })
    end_date: Date | null;

    @Column({ type: "double" })
    produced_quantity: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column({ type: "bigint", unsigned: true, nullable: true })
    machine_id: number | null;

    @ManyToOne(() => Machine, machine => machine.productions)
    machine: Machine;

    @ManyToOne(() => Order)
    order: Order;

    @OneToMany(() => ProductionWorkLog, workLog => workLog.production)
    workLogs: ProductionWorkLog[];
}