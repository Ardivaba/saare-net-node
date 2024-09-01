import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, BaseEntity } from "typeorm";
import { Machine } from "./Machine";
import { Order } from "./Order";

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

    @Column({ type: "double", nullable: true })
    total_quantity: number | null;

    @Column({ type: "double" })
    start_quantity: number;

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
}