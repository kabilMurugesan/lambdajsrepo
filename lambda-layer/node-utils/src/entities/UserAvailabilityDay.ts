import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate, JoinColumn, ManyToOne } from "typeorm";//
import { User } from "./User"; // Import the User entity

@Entity()
export class UserAvailabilityDay {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column("varchar", { nullable: false })
    userId: string;

    @Column("varchar", { length: 5, nullable: false })
    weekday: string;

    @Column("varchar", { nullable: true })
    createdBy: string;

    @Column("timestamp", { nullable: true })
    createdOn: Date;

    @Column("varchar", { nullable: true })
    updatedBy: string;

    @Column("timestamp", { nullable: true })
    updatedOn: Date;

    @ManyToOne(() => User)
    @JoinColumn()
    user: User;
    @BeforeInsert()
    updateCreateDates() {
        const currentDate = new Date();
        this.createdOn = currentDate;
        this.updatedOn = currentDate;
    }

    @BeforeUpdate()
    updateUpdateDates() {
        this.updatedOn = new Date();
    }
}