import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, BaseEntity } from "typeorm";
import { Order } from "./Order";

@Entity()
export class Recipe extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "int", unique: true })
    code: number;

    @Column("varchar")
    description: string;

    @Column("float")
    float_gap: number;

    @Column("float")
    float_length: number;

    @Column("float")
    rope_length: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;

    @OneToMany(() => Order, order => order.recipe)
    orders: Order[];
}