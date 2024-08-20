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
    floatGap: number;

    @Column("float")
    floatLength: number;

    @Column("float")
    ropeLength: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    @OneToMany(() => Order, order => order.recipe)
    orders: Order[];
}