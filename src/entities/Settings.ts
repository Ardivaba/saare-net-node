import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@Entity()
export class Settings extends BaseEntity {
    @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
    id: number;

    @Column({ type: "bigint" })
    maxParkingTime: number;

    @Column({ type: "boolean" })
    parkingLotActive: boolean;

    @Column({ type: "bigint" })
    totalSpaces: number;

    @Column({ type: "bigint" })
    takenSpaces: number;

    @Column({ type: "bigint" })
    signalDelayTime: number;
}