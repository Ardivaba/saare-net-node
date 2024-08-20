import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, BaseEntity } from "typeorm";
import { Machine } from "./Machine";
import { Order } from "./Order";

@Entity()
export class Production extends BaseEntity {
    @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
    id: number;

    @Column({ type: "bigint", nullable: true })
    orderId: number | null;

    @Column({ type: "bigint" })
    recipeCode: number;

    @Column({ type: "datetime", precision: 3, nullable: true })
    startDate: Date | null;

    @Column({ type: "datetime", precision: 3, nullable: true })
    endDate: Date | null;

    @Column({ type: "double", nullable: true })
    totalQuantity: number | null;

    @Column({ type: "double" })
    startQuantity: number;

    @Column({ type: "double" })
    producedQuantity: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: "bigint", unsigned: true, nullable: true })
    machineId: number | null;

    @ManyToOne(() => Machine, machine => machine.productions)
    machine: Machine;

    @ManyToOne(() => Order)
    order: Order;
}