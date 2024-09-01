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

    @Column({ type: "bigint" })
    recipe_code: number;

    @Column({ type: "double", nullable: true })
    float_length: number | null;

    @Column({ type: "double", nullable: true })
    float_gap: number | null;

    @Column({ type: "double", nullable: true })
    rope_length: number | null;

    @Column({ type: "bigint", unsigned: true, nullable: true })
    current_production_id: number | null;

    @Column({ type: "double" })
    produced_rope_length: number;

    @Column({ type: "bigint", nullable: true })
    pending_code: number | null;

    @Column({ type: "double", nullable: true })
    pending_float_length: number | null;

    @Column({ type: "double", nullable: true })
    pending_float_gap: number | null;

    @Column({ type: "double", nullable: true })
    pending_rope_length: number | null;

    @Column({ type: "boolean" })
    recipe_loaded: boolean;

    @Column({ type: "text" })
    name: string;

    @Column({
        type: "enum",
        enum: MachineState,
        default: MachineState.Off
    })
    state: MachineState;

    @Column({ type: "bigint" })
    off_time: number;

    @Column({ type: "bigint" })
    idle_time: number;

    @Column({ type: "bigint" })
    producing_time: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @ManyToOne(() => Worker, worker => worker.machines)
    worker: Worker;

    @OneToMany(() => Production, production => production.machine)
    productions: Production[];
}