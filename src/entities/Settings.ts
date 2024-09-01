import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@Entity()
export class Settings extends BaseEntity {
    @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
    id: number;

    @Column({ type: "bigint" })
    max_parking_time: number;

    @Column({ type: "boolean" })
    parking_lot_active: boolean;

    @Column({ type: "bigint" })
    total_spaces: number;

    @Column({ type: "bigint" })
    taken_spaces: number;

    @Column({ type: "bigint" })
    signal_delay_time: number;
}