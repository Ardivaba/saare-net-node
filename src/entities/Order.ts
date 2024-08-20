import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, BaseEntity } from "typeorm";
import { Recipe } from "./Recipe";
import { Worker } from "./Worker";
import { WorkerLog } from "./WorkerLog";

@Entity()
export class Order extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Recipe, recipe => recipe.orders)
    recipe: Recipe;

    @Column({ type: "text" })
    info: string;

    @Column("float")
    amountOrdered: number;

    @Column("float")
    amountProduced: number;

    @Column({ type: "boolean" })
    isFinished: boolean;

    @ManyToOne(() => Worker, worker => worker.currentOrders)
    currentWorker: Worker;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => WorkerLog, workerLog => workerLog.order)
    workerLogs: WorkerLog[];
}