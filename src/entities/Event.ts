import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, BaseEntity } from "typeorm";

export enum EventType {
    OrderCreated = "order_created",
    OrderUpdated = "order_updated",
    OrderCompleted = "order_completed",
    ProductionStarted = "production_started",
    ProductionCompleted = "production_completed",
    MachineStatusChanged = "machine_status_changed",
    WorkerLoggedIn = "worker_logged_in",
    WorkerLoggedOut = "worker_logged_out"
}

@Entity()
export class Event extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "enum",
        enum: EventType,
        nullable: false
    })
    type: EventType;

    @Column("simple-json")
    data: Record<string, any>;

    @CreateDateColumn()
    created_at: Date;
}