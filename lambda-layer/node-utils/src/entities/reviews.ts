import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BeforeInsert,
    BeforeUpdate,
    // JoinColumn,
    // OneToOne,
} from 'typeorm';
// import { GuardRatings } from './ratings';

@Entity()
export class GuardReviews {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar', { length: 400, nullable: false })
    reviews: string;

    // @Column('varchar', { length: 100, nullable: false })
    // userId: string;    // future reference

    // @Column('varchar', { nullable: false })
    // guardId: string;   // future reference

    @Column('varchar', { nullable: false })
    jobId: string;

    @Column('varchar', { nullable: false })
    reviewedBy: string;

    @Column('varchar', { nullable: false })
    reviewedTo: string;

    @Column('varchar', { nullable: false, default: false })
    isAppRate: string;

    @Column('varchar', { length: 100, nullable: false })
    type: string;

    @Column('boolean', { nullable: true, default: false })
    isDeleted: boolean;

    @Column('varchar', { nullable: true })
    createdBy: string;

    @Column('timestamp', { nullable: true })
    createdOn: Date;

    @Column('varchar', { nullable: true })
    updatedBy: string;

    @Column('timestamp', { nullable: true })
    updatedOn: Date;

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
