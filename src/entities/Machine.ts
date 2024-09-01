import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, BaseEntity } from "typeorm";
import { Worker } from "./Worker";
import { Production } from "./Production";

export enum MachineState {
    Producing = "Producing",
    Waiting = "Waiting",
    Off = "Off"
}

@Entity()
export class Machine extends BaseEntity {
    @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
    id: number;

    @Column({ type: "text" })
    ip: string;

    @Column({ type: "bigint", nullable: true })
    recipe_code: number | null;

    @Column({ type: "double", nullable: true })
    float_length: number | null;

    @Column({ type: "double", nullable: true })
    float_gap: number | null;

    @Column({ type: "double", nullable: true })
    rope_length: number | null;

    @Column({ type: "bigint", unsigned: true, nullable: true })
    current_production_id: number | null;

    @Column({ type: "double", nullable: true, default: 0 })
    produced_rope_length: number;

    @Column({ type: "bigint", nullable: true })
    pending_code: number | null;

    @Column({ type: "double", nullable: true })
    pending_float_length: number | null;

    @Column({ type: "double", nullable: true })
    pending_float_gap: number | null;

    @Column({ type: "double", nullable: true })
    pending_rope_length: number | null;

    @Column({ type: "boolean", default: true })
    recipe_loaded: boolean;

    @Column({ type: "text" })
    name: string;

    @Column({
        type: "enum",
        enum: MachineState,
        default: MachineState.Off
    })
    state: MachineState;

    @Column({ type: "bigint", default: 0 })
    off_time: number;

    @Column({ type: "bigint", default: 0 })
    idle_time: number;

    @Column({ type: "bigint", default: 0 })
    producing_time: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @ManyToOne(() => Worker, worker => worker.machines)
    worker: Worker;

    @Column({ type: "bigint", nullable: true })
    worker_id: number | null;

    @OneToMany(() => Production, production => production.machine)
    productions: Production[];
}