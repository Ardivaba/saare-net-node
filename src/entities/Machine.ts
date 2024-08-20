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
    recipeCode: number;

    @Column({ type: "double", nullable: true })
    floatLength: number | null;

    @Column({ type: "double", nullable: true })
    floatGap: number | null;

    @Column({ type: "double", nullable: true })
    ropeLength: number | null;

    @Column({ type: "bigint", unsigned: true, nullable: true })
    currentProductionId: number | null;

    @Column({ type: "double" })
    producedRopeLength: number;

    @Column({ type: "bigint", nullable: true })
    pendingCode: number | null;

    @Column({ type: "double", nullable: true })
    pendingFloatLength: number | null;

    @Column({ type: "double", nullable: true })
    pendingFloatGap: number | null;

    @Column({ type: "double", nullable: true })
    pendingRopeLength: number | null;

    @Column({ type: "boolean" })
    recipeLoaded: boolean;

    @Column({ type: "text" })
    name: string;

    @Column({
        type: "enum",
        enum: MachineState,
        default: MachineState.Off
    })
    state: MachineState;

    @Column({ type: "bigint" })
    offTime: number;

    @Column({ type: "bigint" })
    idleTime: number;

    @Column({ type: "bigint" })
    producingTime: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Worker, worker => worker.machines)
    worker: Worker;

    @OneToMany(() => Production, production => production.machine)
    productions: Production[];
}