import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate, OneToOne, JoinColumn, ManyToOne } from "typeorm";//
import { UserAvailabilityDay } from "./UserAvailabilityDay";  // Import the UserAvailabilityDay entity
import { User } from "./User";

@Entity()
export class UserAvailabilityDate {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column("varchar", { nullable: false })
    userAvailabilityId: string;

    // @Column("varchar", { length: 5, nullable: false })
    // weekday: string;

    @Column("varchar", { nullable: false })
    userId: string;

    @Column("varchar", { nullable: false })
    startTime: string;

    @Column("varchar", { nullable: false })
    endTime: string;

    @Column("varchar", { nullable: true })
    createdBy: string;

    @Column("timestamp", { nullable: true })
    createdOn: Date;

    @Column("varchar", { nullable: true, length: 50 })
    updatedBy: string;

    @Column("timestamp", { nullable: true })
    updatedOn: Date;

    @OneToOne(() => UserAvailabilityDay)
    @JoinColumn()
    useravailabiltyday: UserAvailabilityDay;
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
