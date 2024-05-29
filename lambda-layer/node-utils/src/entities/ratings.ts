import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BeforeInsert,
    BeforeUpdate,
    JoinColumn,
    ManyToOne,
} from 'typeorm';
import { Job } from './Job';

@Entity()
export class GuardRatings {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar', { length: 100, nullable: false })
    ratings: string;

    @Column('varchar', { length: 400, nullable: true })
    reviews: string;

    @Column('varchar', { length: 100, nullable: false })
    type: string;

    @Column('varchar', { length: 100, nullable: false })
    appRated: string;

    @Column('varchar', { length: 100, nullable: false })
    customerName: string;

    @Column('varchar', { length: 100, nullable: false })
    guardName: string;

    @Column('varchar', { nullable: false, default: false })
    isAppRate: string;

    @Column('boolean', { nullable: true, default: false })
    isDeleted: boolean;

    @Column('varchar', { nullable: false })
    jobId: string;

    @Column('varchar', { nullable: false })
    ratedBy: string;

    @Column('varchar', { nullable: false })
    ratedTo: string;

    @Column('varchar', { nullable: true })
    createdBy: string;

    @Column('timestamp', { nullable: true })
    createdOn: Date;

    @Column('varchar', { nullable: true })
    updatedBy: string;

    @Column('timestamp', { nullable: true })
    updatedOn: Date;

    @ManyToOne(() => Job, { nullable: true })
    @JoinColumn({ name: 'job_id' })
    Job: Job;

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
