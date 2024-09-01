import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, BaseEntity, JoinColumn } from "typeorm";
import { Recipe } from "./Recipe";
import { Worker } from "./Worker";
import { WorkerLog } from "./WorkerLog";

@Entity()
export class Order extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Recipe, recipe => recipe.orders)
    @JoinColumn({ name: "recipe_id" })  // Explicitly specify the column name
    recipe: Recipe;

    @Column({ type: "text" })
    info: string;

    @Column("float")
    amount_ordered: number;

    @Column("float")
    amount_produced: number;

    @Column({ type: "boolean" })
    is_finished: boolean;

    @ManyToOne(() => Worker, worker => worker.current_orders)
    @JoinColumn({ name: "current_worker_id" })  // Explicitly specify the column name
    current_worker: Worker;

    @OneToMany(() => WorkerLog, workerLog => workerLog.order)
    worker_logs: WorkerLog[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}